import { db } from "../../data/db";
import bcrypt from "bcryptjs";

export const registroOffline = async (usuarioData) => {
    const local_id = crypto.randomUUID();

    const payload = { ...usuarioData };
    if (payload.pin) {
        payload.pin_hash = bcrypt.hashSync(payload.pin, 10);
        delete payload.pin;
    }
    if (payload.password) {
        payload.password_hash = bcrypt.hashSync(payload.password, 10);
        delete payload.password;
    }

    const nuevoUsuario = {
        ...payload,
        local_id,
        sync_status: 'PENDIENTE',
        created_at: new Date().toISOString()
    };

    await db.transaction('rw', db.usuarios, db.cola_sincronizacion, async () => {
        await db.usuarios.add(nuevoUsuario);
        await db.cola_sincronizacion.add({
            entidad: 'usuarios',
            entidad_id: local_id,
            accion: 'CREAR',
            datos: nuevoUsuario,
            estado: 'PENDIENTE'
        });
    });

    return nuevoUsuario;
};

export const loginOffline = async (credenciales, esAdmin = false) => {
    if (esAdmin) {
        const user = await db.usuarios.where('email').equals(credenciales.email).first();
        if (!user) throw 'Usuario no encontrado';
        
        if (user.password_hash && bcrypt.compareSync(credenciales.password, user.password_hash)) {
            return user;
        } else if (user.password === credenciales.password) {
            return user;
        } else {
            throw 'Contraseña incorrecta';
        }
    } else {
        const users = await db.usuarios.toArray();
        const posibles = users.filter(u => u.nombre === credenciales.nombre);
        
        let encontrado = null;
        for (const u of posibles) {
            if (u.pin_hash && bcrypt.compareSync(credenciales.pin, u.pin_hash)) {
                encontrado = u;
                break;
            } else if (u.pin === credenciales.pin) {
                encontrado = u;
                break;
            }
        }
        
        if (encontrado) {
            return encontrado;
        } else {
            throw 'Usuario no encontrado o PIN incorrecto';
        }
    }
};