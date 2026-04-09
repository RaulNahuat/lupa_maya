export const initConfiguracionStore = (db) => {
    if (!db.objectStoreNames.contains('configuracion')) {
        db.createObjectStore('configuracion', { keyPath: 'clave' });
    }
};
