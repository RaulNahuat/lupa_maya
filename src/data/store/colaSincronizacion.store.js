export const initColaSincronizacionStore = (db) => {
    if (!db.objectStoreNames.contains('cola_sincronizacion')) {
        const syncStore = db.createObjectStore('cola_sincronizacion', {
            keyPath: 'id',
            autoIncrement: true,
        });
        syncStore.createIndex('estado', 'estado', { unique: false });
    }
};
