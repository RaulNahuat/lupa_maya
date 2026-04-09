export const initProgresoStore = (db) => {
    if (!db.objectStoreNames.contains('progreso_usuarios')) {
        const pStore = db.createObjectStore('progreso_usuarios', { keyPath: 'local_id' });
        pStore.createIndex('usuario_id', 'usuario_id', { unique: false });
        pStore.createIndex('nivel_id', 'nivel_id', { unique: false });
        pStore.createIndex('usuario_local_id', 'usuario_local_id', { unique: false });
    }
};
