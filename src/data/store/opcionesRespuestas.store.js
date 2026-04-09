export const initOpcionesRespuestasStore = (db) => {
    if (!db.objectStoreNames.contains('opciones_respuestas')) {
        const store = db.createObjectStore('opciones_respuestas', { keyPath: 'id' });
        store.createIndex('preguntas_id', 'preguntas_id', { unique: false });
    }
};
