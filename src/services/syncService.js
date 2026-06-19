import { db } from "../data/db";
import { API_BASE_URL } from "../config/api";

const API_SYNC_URL = `${API_BASE_URL}/api/sync`;

/**
 * Pull: descarga cambios del servidor desde la última sincronización.
 * Aplica una estrategia "el más reciente gana" para progreso:
 * si el registro local es más nuevo que el remoto, no se sobreescribe.
 */
export const descargarCambios = async (usuarioLocalId = null, forceFullPull = false) => {
    let lastSync = 0;
    const syncKey = usuarioLocalId ? `lastSync_${usuarioLocalId}` : 'lastSync';

    if (!forceFullPull) {
        const config = await db.configuracion.get(syncKey);
        if (config) lastSync = config.valor;
    }

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
        grupos_niveles = [],
        glifos = [],
        preguntas = [],
        opciones_respuestas = [],
        nivel_glifos_objetivos = [],
        progreso_usuarios = [],
        insignias = [],
        usuario_insignias = [],
        grupos_escolares = [],
        grupo_escolar_grupo_nivel = [],
        usuario_grupo_nivel = []
    } = result.cambios;

    // Obtener los IDs de elementos que tienen cambios locales pendientes de sincronizar
    const itemsPendientes = await db.cola_sincronizacion
        .where('estado')
        .equals('PENDIENTE')
        .toArray();

    const glifosAfectadosIds = new Set(
        itemsPendientes
            .filter(item => item.entidad === 'glifos' && item.datos?.id)
            .map(item => Number(item.datos.id))
    );

    const gruposAfectadosIds = new Set(
        itemsPendientes
            .filter(item => item.entidad === 'grupos_niveles' && item.datos?.id)
            .map(item => Number(item.datos.id))
    );

    const nivelesAfectadosIds = new Set(
        itemsPendientes
            .filter(item => item.entidad === 'niveles' && item.datos?.id)
            .map(item => Number(item.datos.id))
    );

    await db.transaction(
        'rw',
        db.usuarios,
        db.admins,
        db.niveles,
        db.grupos_niveles,
        db.glifos,
        db.preguntas,
        db.opciones_respuestas,
        db.nivel_glifos_objetivos,
        db.progreso_usuarios,
        db.insignias,
        db.usuario_insignias,
        db.grupos_escolares,
        db.grupo_escolar_grupo_nivel,
        db.usuario_grupo_nivel,
        db.configuracion,
        async () => {

            // INSIGNIAS
            if (insignias.length > 0) {
                await db.insignias.bulkPut(insignias);
            }

            // USUARIO_INSIGNIAS
            if (usuario_insignias && usuario_insignias.length > 0) {
                for (const ui of usuario_insignias) {
                    if (ui.deleted_at) {
                        await db.usuario_insignias.delete(ui.local_id);
                    } else {
                        await db.usuario_insignias.put({
                            ...ui,
                            sync_status: 'SINCRONIZADO'
                        });
                    }
                }
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

                    if (user.racha !== undefined && user.local_id) {
                        await db.configuracion.put({
                            clave: `racha_${user.local_id}`,
                            valor: user.racha,
                        });
                    }
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

            // GRUPOS ESCOLARES
            if (grupos_escolares && grupos_escolares.length > 0) {
                for (const ge of grupos_escolares) {
                    if (ge.deleted_at) {
                        await db.grupos_escolares.delete(ge.local_id);
                    } else {
                        await db.grupos_escolares.put({
                            ...ge,
                            sync_status: 'SINCRONIZADO'
                        });
                    }
                }
            }

            // GRUPO ESCOLAR GRUPO NIVEL
            if (grupo_escolar_grupo_nivel && grupo_escolar_grupo_nivel.length > 0) {
                await db.grupo_escolar_grupo_nivel.bulkPut(grupo_escolar_grupo_nivel);
            }

            // USUARIO GRUPO NIVEL
            if (usuario_grupo_nivel && usuario_grupo_nivel.length > 0) {
                await db.usuario_grupo_nivel.bulkPut(usuario_grupo_nivel);
            }

            // NIVELES - Filtrar para no sobreescribir niveles con cambios locales pendientes
            if (niveles.length > 0) {
                const nivelesFiltrados = niveles.filter(n => !nivelesAfectadosIds.has(Number(n.id)));
                if (nivelesFiltrados.length > 0) {
                    await db.niveles.bulkPut(nivelesFiltrados);
                }
            }

            // GRUPOS DE NIVELES (Categorías) - Filtrar para no sobreescribir cambios locales pendientes
            if (grupos_niveles.length > 0) {
                const gruposFiltrados = grupos_niveles.filter(g => !gruposAfectadosIds.has(Number(g.id)));
                if (gruposFiltrados.length > 0) {
                    await db.grupos_niveles.bulkPut(gruposFiltrados);
                }
            }

            // GLIFOS - Filtrar para no sobreescribir cambios locales pendientes (resuelve el bug del doble borrado)
            if (glifos.length > 0) {
                const glifosFiltrados = glifos.filter(g => !glifosAfectadosIds.has(Number(g.id)));
                if (glifosFiltrados.length > 0) {
                    await db.glifos.bulkPut(glifosFiltrados);
                }
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
    if (!result.success) {
        console.error(`[SYNC ERROR] Falló la sincronización del item ${item.id} (${item.entidad}):`, result.error || result.message);
        return;
    }

    await db.transaction(
        'rw',
        db.cola_sincronizacion,
        db.usuarios,
        db.progreso_usuarios,
        db.grupos_niveles,
        db.glifos,
        db.niveles,
        db.preguntas,
        db.opciones_respuestas,
        db.nivel_glifos_objetivos,
        db.usuario_insignias,
        db.insignias,
        db.grupos_escolares,
        db.grupo_escolar_grupo_nivel,
        db.usuario_grupo_nivel,
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

                        // Propagar a usuario_insignias locales
                        const insigniasLocales = await db.usuario_insignias
                            .where('usuario_local_id')
                            .equals(user.local_id)
                            .toArray();
                        for (const ui of insigniasLocales) {
                            if (!ui.usuario_id) {
                                await db.usuario_insignias.put({
                                    ...ui,
                                    usuario_id: idServidor
                                });
                            }
                        }

                        // Propagar a la cola de sincronización pendiente
                        const colaPendiente = await db.cola_sincronizacion
                            .where('estado')
                            .equals('PENDIENTE')
                            .toArray();
                        for (const c of colaPendiente) {
                            if (c.entidad === 'usuario_insignias' && c.datos && c.datos.usuario_local_id === user.local_id) {
                                c.datos.usuario_id = idServidor;
                                await db.cola_sincronizacion.put(c);
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

            if (item.entidad === 'usuario_insignias') {
                const ui = await db.usuario_insignias.get(item.datos.local_id);
                if (ui) {
                    await db.usuario_insignias.put({
                        ...ui,
                        sync_status: 'SINCRONIZADO',
                        usuario_id: ui.usuario_id || result.data?.usuario_id || null
                    });
                }
            }

            if (item.entidad === 'insignias') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const insignia = await db.insignias.get(item.datos.id);
                        if (insignia) {
                            await db.insignias.delete(item.datos.id);
                            await db.insignias.put({
                                ...insignia,
                                id: Number(idServidor)
                            });
                        }

                        // Actualizar referencias a ID temporal en cola_sincronizacion para usuario_insignias
                        const colaPendiente = await db.cola_sincronizacion
                            .where('estado')
                            .equals('PENDIENTE')
                            .toArray();
                        for (const c of colaPendiente) {
                            if (c.entidad === 'usuario_insignias' && c.datos && Number(c.datos.insignia_id) === Number(item.datos.id)) {
                                c.datos.insignia_id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                        }
                    }
                } else {
                    if (item.accion === 'ELIMINAR') {
                        await db.insignias.delete(item.datos.id);
                    }
                }
            }

            if (item.entidad === 'grupos_niveles') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const grupo = await db.grupos_niveles.get(item.datos.id);
                        if (grupo) {
                            await db.grupos_niveles.delete(item.datos.id);
                            await db.grupos_niveles.put({
                                ...grupo,
                                id: Number(idServidor)
                            });

                            //Propagar el id del servidor a los glifos
                            const glifosAfectados = await db.glifos
                                .where('grupo_id')
                                .equals(Number(item.datos.id))
                                .toArray();
                            for (const g of glifosAfectados) {
                                await db.glifos.put({
                                    ...g,
                                    grupo_id: Number(idServidor)
                                });
                            }

                            //Propagar el id del servidor a los niveles
                            const nivelesAfectados = await db.niveles
                                .where('grupo_id')
                                .equals(Number(item.datos.id))
                                .toArray();
                            for (const n of nivelesAfectados) {
                                await db.niveles.put({
                                    ...n,
                                    grupo_id: Number(idServidor)
                                });
                            }

                            //Actualizar elementos pendientes de la cola que hacen referencia al ID temporal antiguo
                            const colaPendiente = await db.cola_sincronizacion
                                .where('estado')
                                .equals('PENDIENTE')
                                .toArray();
                            for (const c of colaPendiente) {
                                if (c.datos && Number(c.datos.grupo_id) === Number(item.datos.id)) {
                                    c.datos.grupo_id = Number(idServidor);
                                    await db.cola_sincronizacion.put(c);
                                }
                            }

                            //Si el usuario está actualmente en la página de detalles del ID temporal, actualiza la URL y despacha el evento
                            if (typeof window !== 'undefined' && window.location.pathname === `/admin/glyphs/block/${item.datos.id}`) {
                                window.history.replaceState(null, '', `/admin/glyphs/block/${idServidor}`);
                                window.dispatchEvent(new CustomEvent('block-id-synced', { 
                                    detail: { oldId: Number(item.datos.id), newId: Number(idServidor) } 
                                }));
                            }
                        }
                    }
                } else {
                    const grupo = await db.grupos_niveles.get(item.datos.id);
                    if (grupo) {
                        if (item.accion === 'ELIMINAR') {
                            await db.grupos_niveles.delete(item.datos.id);
                        }
                    }
                }
            }
            if (item.entidad === 'glifos') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const glifo = await db.glifos.get(item.datos.id);
                        if (glifo) {
                            await db.glifos.delete(item.datos.id);
                            await db.glifos.put({
                                ...glifo,
                                id: Number(idServidor)
                            });
                        }
                    }
                } else {
                    if (item.accion === 'ELIMINAR') {
                        await db.glifos.delete(item.datos.id);
                    }
                }
            }
            if (item.entidad === 'niveles') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const nivel = await db.niveles.get(item.datos.id);
                        if (nivel) {
                            await db.niveles.delete(item.datos.id);
                            await db.niveles.put({
                                ...nivel,
                                id: Number(idServidor)
                            });
                        }

                        // Actualizar en IndexedDB local las preguntas y objetivos con el ID temporal del nivel
                        const preguntasLocales = await db.preguntas
                            .where('nivel_id')
                            .equals(Number(item.datos.id))
                            .toArray();
                        for (const q of preguntasLocales) {
                            await db.preguntas.put({
                                ...q,
                                nivel_id: Number(idServidor)
                            });
                        }

                        const objetivosLocales = await db.nivel_glifos_objetivos
                            .where('nivel_id')
                            .equals(Number(item.datos.id))
                            .toArray();
                        for (const obj of objetivosLocales) {
                            await db.nivel_glifos_objetivos.put({
                                ...obj,
                                nivel_id: Number(idServidor)
                            });
                        }

                        // Propagar el ID del servidor a los elementos de la cola que hacen referencia al ID temporal del nivel
                        const colaPendiente = await db.cola_sincronizacion
                            .where('estado')
                            .equals('PENDIENTE')
                            .toArray();
                        for (const c of colaPendiente) {
                            if (c.entidad === 'niveles' && c.datos && Number(c.datos.id) === Number(item.datos.id)) {
                                c.datos.id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                            if (c.entidad === 'preguntas' && c.datos && Number(c.datos.nivel_id) === Number(item.datos.id)) {
                                c.datos.nivel_id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                            if (c.entidad === 'nivel_glifos_objetivos' && c.datos && Number(c.datos.nivel_id) === Number(item.datos.id)) {
                                c.datos.nivel_id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                        }
                    }
                } else {
                    if (item.accion === 'ELIMINAR') {
                        await db.niveles.delete(item.datos.id);
                    }
                }
            }
            if (item.entidad === 'preguntas') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const pregunta = await db.preguntas.get(item.datos.id);
                        if (pregunta) {
                            await db.preguntas.delete(item.datos.id);
                            await db.preguntas.put({
                                ...pregunta,
                                id: Number(idServidor)
                            });
                        }

                        // Actualizar en IndexedDB local las opciones ya guardadas con el ID temporal de la pregunta
                        const opcionesLocales = await db.opciones_respuestas
                            .where('preguntas_id')
                            .equals(Number(item.datos.id))
                            .toArray();
                        for (const opt of opcionesLocales) {
                            await db.opciones_respuestas.put({
                                ...opt,
                                preguntas_id: Number(idServidor)
                            });
                        }

                        // Propagar el ID del servidor a las opciones vinculadas en la cola
                        const colaPendiente = await db.cola_sincronizacion
                            .where('estado')
                            .equals('PENDIENTE')
                            .toArray();
                        for (const c of colaPendiente) {
                            if (c.entidad === 'opciones_respuestas' && c.datos && Number(c.datos.preguntas_id) === Number(item.datos.id)) {
                                c.datos.preguntas_id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                            if (c.entidad === 'preguntas' && c.datos && Number(c.datos.id) === Number(item.datos.id)) {
                                c.datos.id = Number(idServidor);
                                await db.cola_sincronizacion.put(c);
                            }
                        }
                    }
                } else {
                    if (item.accion === 'ELIMINAR') {
                        await db.preguntas.delete(item.datos.id);
                    }
                }
            }
            if (item.entidad === 'opciones_respuestas') {
                if (item.accion === 'CREAR') {
                    const idServidor = result.data?.id ?? null;
                    if (idServidor) {
                        const opcion = await db.opciones_respuestas.get(item.datos.id);
                        if (opcion) {
                            await db.opciones_respuestas.delete(item.datos.id);
                            await db.opciones_respuestas.put({
                                ...opcion,
                                id: Number(idServidor)
                            });
                        }
                    }
                } else {
                    if (item.accion === 'ELIMINAR') {
                        await db.opciones_respuestas.delete(item.datos.id);
                    }
                }
            }

            if (item.entidad === 'grupos_escolares') {
                const ge = await db.grupos_escolares.get(item.datos.local_id);
                if (ge) {
                    await db.grupos_escolares.put({ ...ge, sync_status: 'SINCRONIZADO' });
                    if (item.accion === 'ELIMINAR') {
                        await db.grupos_escolares.delete(item.datos.local_id);
                    }
                }
            }

            if (item.entidad === 'grupo_escolar_grupo_nivel') {
                const ggn = await db.grupo_escolar_grupo_nivel.where('[grupo_escolar_id+grupo_nivel_id]').equals([item.datos.grupo_escolar_id, item.datos.grupo_nivel_id]).first();
                if (ggn) {
                    await db.grupo_escolar_grupo_nivel.put({ ...ggn, sync_status: 'SINCRONIZADO' });
                }
            }

            if (item.entidad === 'usuario_grupo_nivel') {
                const ugn = await db.usuario_grupo_nivel.where('[usuario_id+grupo_nivel_id]').equals([item.datos.usuario_id, item.datos.grupo_nivel_id]).first();
                if (ugn) {
                    await db.usuario_grupo_nivel.put({ ...ugn, sync_status: 'SINCRONIZADO' });
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
            ...porEntidad('grupos_escolares'),
            ...porEntidad('grupo_escolar_grupo_nivel'),
            ...porEntidad('usuario_grupo_nivel'),
            ...porEntidad('usuarios'),
            ...porEntidad('insignias'),
            ...porEntidad('progreso_usuarios'),
            ...porEntidad('usuario_insignias'),
            ...porEntidad('grupos_niveles'),
            ...porEntidad('glifos'),
            ...porEntidad('niveles'),
            ...porEntidad('preguntas'),
            ...porEntidad('opciones_respuestas'),
            ...porEntidad('nivel_glifos_objetivos'),
            ...items.filter((i) => ![
                'usuarios', 'insignias', 'progreso_usuarios', 'usuario_insignias', 'grupos_niveles', 'glifos', 
                'niveles', 'preguntas', 'opciones_respuestas', 'nivel_glifos_objetivos',
                'grupos_escolares', 'grupo_escolar_grupo_nivel', 'usuario_grupo_nivel'
            ].includes(i.entidad))
        ];

        for (const item of ordenados) {
            try {
                // Obtener el item actualizado de la base de datos para capturar cualquier ID real propagado
                const latestItem = await db.cola_sincronizacion.get(item.id);
                if (latestItem && latestItem.estado === 'PENDIENTE') {
                    await procesarItem(latestItem);
                }
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