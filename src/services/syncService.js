import { db } from "../data/db";

const API_SYNC_URL = "http://localhost:5000/api/sync";

export const descargarCambios = async () => {
    console.log("Descargando cambios desde el servidor...");

    let lastSync = 0;
    try {
        const config = await db.configuracion.get('lastSync');
        if (config) {
            lastSync = config.valor;
        }
    } catch (e) {
        lastSync = 0;
    }

    try {
        const response = await fetch(`${API_SYNC_URL}/pull?lastSync=${lastSync}`);
        const result = await response.json();

        if (result.success && result.cambios.length > 0) {
            console.log(`Recibidos ${result.cambios.length} cambios.`);
            
            await db.transaction('rw', db.usuarios, db.configuracion, async () => {
                for (const userRemote of result.cambios) {
                    if (!userRemote.local_id) {
                        console.warn("Saltando usuario sin local_id válido:", userRemote.id);
                        continue;
                    }

                    if (userRemote.deleted_at) {
                        await db.usuarios.delete(userRemote.local_id);
                    } else {
                        await db.usuarios.put({
                            ...userRemote,
                            sync_status: 'SINCRONIZADO'
                        });
                    }
                }
                
                await db.configuracion.put({ clave: 'lastSync', valor: result.serverTime });
            });
            console.log("Cambios aplicados correctamente.");
        }
    } catch (error) {
        console.error("Error al descargar cambios:", error);
    }
};

export const procesarColaSincronizacion = async () => {
    console.log("Iniciando ciclo de sincronización...");
    
    // Primero bajamos los cambios del servidor (Pull)
    await descargarCambios();

    // Luego subimos lo que tengamos pendiente (Push)
    const items = await db.cola_sincronizacion.where('estado').equals('PENDIENTE').toArray();

    if (items.length === 0) {
        console.log("No hay datos locales para subir.");
        return;
    }

    for (const item of items) {
        try {
            const response = await fetch(API_SYNC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            const result = await response.json();

            if (result.success) {
                await db.transaction('rw', db.cola_sincronizacion, db.usuarios, async () => {
                    item.estado = 'ENVIADO';
                    await db.cola_sincronizacion.put(item);

                    const user = await db.usuarios.get(item.entidad_id);
                    if (user) {
                        user.sync_status = 'SINCRONIZADO';
                        await db.usuarios.put(user);
                    }
                });
                console.log(`Ítem ${item.id} subido con éxito.`);
            }
        } catch (error) {
            console.error("Error subiendo ítem:", item.id, error);
        }
    }
};

export const initSyncSyncService = () => {
    window.addEventListener('online', () => {
        console.log("Conexión restaurada. Sincronizando...");
        procesarColaSincronizacion();
    });

    if (navigator.onLine) {
        procesarColaSincronizacion();
    }
};
