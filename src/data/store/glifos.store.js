export const initGlifosStore = (db) => {
    if (!db.objectStoreNames.contains('glifos')) {
        const store = db.createObjectStore('glifos', { keyPath: 'id' });
        store.createIndex('grupo_id', 'grupo_id', { unique: false });
    }
};
