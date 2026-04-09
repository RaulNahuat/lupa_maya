export const initInsigniasStore = (db) => {
    if (!db.objectStoreNames.contains('insignias')) {
        db.createObjectStore('insignias', { keyPath: 'id' });
    }
};
