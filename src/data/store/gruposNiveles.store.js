export const initGruposNivelesStore = (db) => {
    if (!db.objectStoreNames.contains('grupos_niveles')) {
        db.createObjectStore('grupos_niveles', { keyPath: 'id' });
    }
};
