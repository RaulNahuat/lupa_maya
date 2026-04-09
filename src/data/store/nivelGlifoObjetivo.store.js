export const initNivelGlifoObjetivoStore = (db) => {
    if (!db.objectStoreNames.contains('nivel_glifos_objetivos')) {
        const store = db.createObjectStore('nivel_glifos_objetivos', { keyPath: 'id' });
        store.createIndex('nivel_id', 'nivel_id', { unique: false });
        store.createIndex('glifo_id', 'glifo_id', { unique: false });
    }
};
