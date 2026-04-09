export const initRegistrosEscaneoStore = (db) => {
    if (!db.objectStoreNames.contains('registro_escaneos')) {
        const store = db.createObjectStore('registro_escaneos', { keyPath: 'local_id' });
        store.createIndex('usuario_id', 'usuario_id', { unique: false });
        store.createIndex('usuario_local_id', 'usuario_local_id', { unique: false });
        store.createIndex('nivel_id', 'nivel_id', { unique: false });
    }
};
