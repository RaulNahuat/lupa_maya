export const initPreguntasStore = (db) => {
    if (!db.objectStoreNames.contains('preguntas')) {
        const store = db.createObjectStore('preguntas', { keyPath: 'id' });
        store.createIndex('nivel_id', 'nivel_id', { unique: false });
    }
};
