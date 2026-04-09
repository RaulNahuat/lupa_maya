import { initDB } from "../../data/db";

export const registroOffline = async (usuarioData) => {
    const db = await initDB();
    const local_id = crypto.randomUUID();

    const nuevoUsuario = {
        ...usuarioData,
        local_id,
        sync_status: 'PENDIENTE',
        created_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios', 'cola_sincronizacion'], 'readwrite');

        transaction.objectStore('usuarios').add(nuevoUsuario);

        transaction.objectStore('cola_sincronizacion').add({
            entidad: 'usuarios',
            entidad_id: local_id,
            accion: 'CREAR',
            datos: nuevoUsuario,
            estado: 'PENDIENTE'
        });

        transaction.oncomplete = () => resolve(nuevoUsuario);
        transaction.onerror = () => reject(transaction.error);
    });
};

export const loginOffline = async (credenciales, esAdmin = false) => {
    const db = await initDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['usuarios'], 'readonly');
        const store = transaction.objectStore('usuarios');
        
        if (esAdmin) {
            const index = store.index('email');
            const request = index.get(credenciales.email);
            request.onsuccess = () => {
                const user = request.result;
                if (!user) return reject('Usuario no encontrado');
                if (user.password === credenciales.password) {
                    resolve(user);
                } else {
                    reject('Contraseña incorrecta');
                }
            };
            request.onerror = () => reject(request.error);
        } else {
            const request = store.getAll();
            request.onsuccess = () => {
                const users = request.result;
                const encontrado = users.find(u => u.nombre === credenciales.nombre && u.pin === credenciales.pin);
                if (encontrado) {
                    resolve(encontrado);
                } else {
                    reject('Usuario no encontrado o PIN incorrecto');
                }
            };
            request.onerror = () => reject(request.error);
        }
    });
};