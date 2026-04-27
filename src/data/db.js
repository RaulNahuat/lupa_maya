import Dexie from 'dexie';

export const db = new Dexie("lupa_maya_db");

// Versión 1: esquema en desarrollo (incluye todos los índices necesarios)
db.version(1).stores({
    admins: 'local_id, email, sync_status',
    usuarios: 'local_id, username, sync_status',
    cola_sincronizacion: '++id, estado, entidad',
    configuracion: 'clave',
    niveles: 'id, grupo_id, numero, tipo, orden_secuencia',
    progreso_usuarios: 'local_id, usuario_id, nivel_id, usuario_local_id, sync_status, updated_at, [usuario_local_id+nivel_id]',
    glifos: 'id, grupo_id',
    grupos_niveles: 'id',
    insignias: 'id',
    nivel_glifos_objetivos: 'id, nivel_id, glifo_id',
    preguntas: 'id, nivel_id',
    opciones_respuestas: 'id, preguntas_id',
    registro_escaneos: 'local_id, usuario_id, usuario_local_id, nivel_id',
    usuario_insignias: 'local_id, usuario_id, insignia_id, usuario_local_id'
});

export const initDB = async () => {
    await db.open();
    return db;
};