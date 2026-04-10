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
        const nBuscado = credenciales.nombre.trim().toLowerCase();
        const pBuscado = String(credenciales.pin);
        
        const posibles = users.filter(u => {
            const n = u.nombre?.trim().toLowerCase() || "";
            const a = u.apellido?.trim().toLowerCase() || "";
            const nombreCompleto = (n + " " + a).trim();
            
            return n === nBuscado || nombreCompleto === nBuscado;
        });
        
        console.log("Usuarios en DB local:", users.length, "Posibles coincidencias:", posibles.length);
        
        let encontrado = null;
        for (const u of posibles) {
            let esValido = false;
            
            if (u.pin === pBuscado) {
                esValido = true;
            } else if (u.pin_hash === pBuscado) {
                esValido = true;
            } else if (u.pin_hash) {
                try {
                    if (bcrypt.compareSync(pBuscado, u.pin_hash)) {
                        esValido = true;
                    }
                } catch (e) {
                    console.error("Error al comparar hash (es normal si era texto plano)", e);
                }
            }
            
            if (esValido) {
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