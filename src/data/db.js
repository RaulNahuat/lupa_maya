import Dexie from 'dexie';

export const db = new Dexie("lupa_maya_db");

db.version(1).stores({
    usuarios: 'local_id, email, rol',
    cola_sincronizacion: '++id, estado',
    configuracion: 'clave',
    niveles: 'id',
    progreso_usuarios: 'local_id, usuario_id, nivel_id, usuario_local_id',
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