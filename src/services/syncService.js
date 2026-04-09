import { initDB } from "../data/db";

const API_SYNC_URL = "http://localhost:5000/api/sync";

export const descargarCambios = async () => {
    console.log("Descargando cambios desde el servidor...");
    const db = await initDB();

    // 1. Obtener el timestamp de la última sincronización
    const lastSync = await new Promise((resolve) => {
        const transaction = db.transaction(['configuracion'], 'readonly');
        const store = transaction.objectStore('configuracion');
        const request = store.get('lastSync');
        request.onsuccess = () => resolve(request.result ? request.result.valor : 0);
        request.onerror = () => resolve(0);
    });

    try {
        const response = await fetch(`${API_SYNC_URL}/pull?lastSync=${lastSync}`);
        const result = await response.json();

        if (result.success && result.cambios.length > 0) {
            console.log(`Recibidos ${result.cambios.length} cambios.`);
            
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(['usuarios', 'configuracion'], 'readwrite');
                const userStore = transaction.objectStore('usuarios');
                const configStore = transaction.objectStore('configuracion');

                for (const userRemote of result.cambios) {
                    if (!userRemote.local_id) {
                        console.warn("Saltando usuario sin local_id válido:", userRemote.id);
                        continue;
                    }

                    if (userRemote.deleted_at) {
                        // Si está borrado en el servidor, lo borramos localmente
                        userStore.delete(userRemote.local_id);
                    } else {
                        // Si no, lo guardamos o actualizamos
                        userStore.put({
                            ...userRemote,
                            sync_status: 'SINCRONIZADO'
                        });
                    }
                }

                // Guardar el nuevo timestamp
                configStore.put({ clave: 'lastSync', valor: result.serverTime });

                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
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
    const db = await initDB();
    
    const items = await new Promise((resolve, reject) => {
        const transaction = db.transaction(['cola_sincronizacion'], 'readonly');
        const store = transaction.objectStore('cola_sincronizacion');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.filter(item => item.estado === 'PENDIENTE'));
        request.onerror = () => reject(request.error);
    });

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
                await new Promise((resolve, reject) => {
                    const updateTransaction = db.transaction(['cola_sincronizacion', 'usuarios'], 'readwrite');
                    const colaStore = updateTransaction.objectStore('cola_sincronizacion');
                    const userStore = updateTransaction.objectStore('usuarios');

                    item.estado = 'ENVIADO';
                    colaStore.put(item);

                    const userRequest = userStore.get(item.entidad_id);
                    userRequest.onsuccess = () => {
                        const user = userRequest.result;
                        if (user) {
                            user.sync_status = 'SINCRONIZADO';
                            userStore.put(user);
                        }
                    };

                    updateTransaction.oncomplete = () => resolve();
                    updateTransaction.onerror = () => reject(updateTransaction.error);
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
