export const initUsuarioInsigniasStore = (db) => {
    if (!db.objectStoreNames.contains('usuario_insignias')) {
        const store = db.createObjectStore('usuario_insignias', { keyPath: 'local_id' });
        store.createIndex('usuario_id', 'usuario_id', { unique: false });
        store.createIndex('insignia_id', 'insignia_id', { unique: false });
        store.createIndex('usuario_local_id', 'usuario_local_id', { unique: false });
    }
};
