import { db } from "../data/db";
import { API_BASE_URL } from "../config/api";

const API_SYNC_URL = `${API_BASE_URL}/api/sync`;

/**
 * Pull: descarga cambios del servidor desde la última sincronización.
 * Aplica una estrategia "el más reciente gana" para progreso:
 * si el registro local es más nuevo que el remoto, no se sobreescribe.
 */
export const descargarCambios = async (usuarioLocalId = null) => {
    let lastSync = 0;
    const syncKey = usuarioLocalId ? `lastSync_${usuarioLocalId}` : 'lastSync';

    const config = await db.configuracion.get(syncKey);
    if (config) lastSync = config.valor;

    const usuarioParam = usuarioLocalId ? `&usuario_local_id=${usuarioLocalId}` : '';

    let result;
    try {
        const response = await fetch(`${API_SYNC_URL}/pull?lastSync=${lastSync}${usuarioParam}`);
        result = await response.json();
    } catch (error) {
        console.warn("Pull sync fallido (sin conexion o error de red):", error);
        return;
    }

    if (!result.success) return;

    const {
        usuarios = [],
        admins = [],
        niveles = [],
        glifos = [],
        preguntas = [],
        opciones_respuestas = [],
        nivel_glifos_objetivos = [],
        progreso_usuarios = [],
        insignias = []
    } = result.cambios;

    await db.transaction(
        'rw',
        db.usuarios,
        db.admins,
        db.niveles,
        db.glifos,
        db.preguntas,
        db.opciones_respuestas,
        db.nivel_glifos_objetivos,
        db.progreso_usuarios,
        db.insignias,
        db.configuracion,
        async () => {

            // INSIGNIAS
            if (insignias.length > 0) {
                await db.insignias.bulkPut(insignias);
            }

            // USUARIOS
            for (const user of usuarios) {
                if (user.deleted_at) {
                    await db.usuarios.delete(user.local_id);
                } else {
                    await db.usuarios.put({
                        ...user,
                        sync_status: 'SINCRONIZADO'
                    });
                }
            }

            // ADMINS
            for (const admin of admins) {
                if (admin.deleted_at) {
                    await db.admins.delete(admin.local_id);
                } else {
                    await db.admins.put({
                        ...admin,
                        sync_status: 'SINCRONIZADO'
                    });
                }
            }

            // NIVELES
            if (niveles.length > 0) {
                await db.niveles.bulkPut(niveles);
            }

            // GLIFOS
            if (glifos.length > 0) {
                await db.glifos.bulkPut(glifos);
            }

            // PREGUNTAS - contenido de niveles tipo APRENDIZAJE
            if (preguntas.length > 0) {
                await db.preguntas.bulkPut(preguntas);
            }

            // OPCIONES DE RESPUESTA
            if (opciones_respuestas.length > 0) {
                await db.opciones_respuestas.bulkPut(opciones_respuestas);
            }

            // GLIFOS OBJETIVO - contenido de niveles tipo BÚSQUEDA
            if (nivel_glifos_objetivos.length > 0) {
                await db.nivel_glifos_objetivos.bulkPut(nivel_glifos_objetivos);
            }

            // PROGRESO - estrategia "el más reciente gana"
            for (const remote of progreso_usuarios) {

                // Si el registro remoto no tiene local_id no se puede hacer lookup local, se guarda directamente
                if (!remote.local_id) {
                    await db.progreso_usuarios.put({
                        ...remote,
                        sync_status: 'SINCRONIZADO'
                    });
                    continue;
                }

                const local = await db.progreso_usuarios.get(remote.local_id);

                // Si el local es mas nuevo, no sobreescribir
                if (local && new Date(local.updated_at) > new Date(remote.updated_at)) {
                    continue;
                }

                await db.progreso_usuarios.put({
                    ...remote,
                    sync_status: 'SINCRONIZADO'
                });
            }

            await db.configuracion.put({
                clave: syncKey,
                valor: result.serverTime
            });
        }
    );
};

/**
 * Sube un item de la cola al servidor y actualiza el estado local.
 * Si es un usuario recien sincronizado, propaga su ID real al progreso pendiente.
 */
const procesarItem = async (item) => {
    const response = await fetch(API_SYNC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
    });

    const result = await response.json();
    if (!result.success) return;

    await db.transaction(
        'rw',
        db.cola_sincronizacion,
        db.usuarios,
        db.progreso_usuarios,
        async () => {
            await db.cola_sincronizacion.put({ ...item, estado: 'ENVIADO' });

            if (item.entidad === 'usuarios') {
                const user = await db.usuarios.get(item.datos.local_id);
                if (user) {
                    await db.usuarios.put({ ...user, sync_status: 'SINCRONIZADO' });

                    const idServidor = result.data?.id ?? null;
                    if (idServidor && item.accion === 'CREAR') {
                        const progresosPendientes = await db.progreso_usuarios
                            .where('usuario_local_id')
                            .equals(user.local_id)
                            .toArray();

                        for (const p of progresosPendientes) {
                            if (!p.usuario_id) {
                                await db.progreso_usuarios.put({
                                    ...p,
                                    usuario_id: idServidor
                                });
                            }
                        }
                    }
                    
                    if (item.accion === 'ELIMINAR') {
                        await db.usuarios.delete(item.datos.local_id);
                    }
                }
            }

            if (item.entidad === 'progreso_usuarios') {
                const progreso = await db.progreso_usuarios.get(item.datos.local_id);
                if (progreso) {
                    await db.progreso_usuarios.put({
                        ...progreso,
                        sync_status: 'SINCRONIZADO'
                    });
                }
            }
        }
    );

    console.log(`Item ${item.id} (${item.entidad}) subido con exito.`);
};

let isSyncing = false;

/**
 * Ciclo completo: pull primero, push despues.
 * Usuarios se procesan antes que progreso para garantizar
 * que el usuario_id real este disponible al enviar el progreso.
 */
export const procesarColaSincronizacion = async (usuarioLocalId = null) => {
    if (isSyncing) {
        console.log("Sincronización ya en curso, ignorando llamada duplicada.");
        return;
    }

    isSyncing = true;
    console.log("Iniciando ciclo de sincronizacion...");

    try {
        await descargarCambios(usuarioLocalId);

        const items = await db.cola_sincronizacion
            .where('estado')
            .equals('PENDIENTE')
            .toArray();

        if (items.length === 0) {
            console.log("No hay datos locales para subir.");
            return;
        }

        const porEntidad = (entidad) => items.filter((i) => i.entidad === entidad);
        const ordenados = [
            ...porEntidad('usuarios'),
            ...porEntidad('progreso_usuarios'),
            ...items.filter((i) => i.entidad !== 'usuarios' && i.entidad !== 'progreso_usuarios')
        ];

        for (const item of ordenados) {
            try {
                await procesarItem(item);
            } catch (error) {
                console.error(`Error subiendo item ${item.id} (${item.entidad}):`, error);
            }
        }
    } catch (err) {
        console.error("Error crítico en el proceso de sincronización:", err);
    } finally {
        isSyncing = false;
        console.log("Ciclo de sincronizacion finalizado.");
    }
};