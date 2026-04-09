export const initNivelesStore = (db) => {
    if (!db.objectStoreNames.contains('niveles')) {
        db.createObjectStore('niveles', { keyPath: 'id' });
    }
};
