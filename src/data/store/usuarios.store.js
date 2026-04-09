export const initUsuariosStore = (db) => {
    if (!db.objectStoreNames.contains('usuarios')) {
        const userStore = db.createObjectStore('usuarios', { keyPath: 'local_id' });
        userStore.createIndex('email', 'email', { unique: false });
        userStore.createIndex('rol', 'rol', { unique: false });
    }
};
