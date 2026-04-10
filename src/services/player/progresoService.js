import { db } from '../../data/db';
import { v4 as uuidv4 } from 'uuid';

/**
 * Guarda o actualiza el progreso de un usuario en un nivel.
 *
 * Nota: si el usuario se registró offline, usuario_id puede ser null
 * en este momento. syncService se encarga de actualizar ese campo
 * con el ID real del servidor una vez que el usuario se sincronice.
 */
export const guardarProgreso = async ({ usuario, nivel, estrellas, intentos }) => {

  await db.transaction('rw', db.progreso_usuarios, db.cola_sincronizacion, async () => {

    // Buscar si ya existe un registro para este usuario y nivel
    const existente = await db.progreso_usuarios
      .where('[usuario_local_id+nivel_id]')
      .equals([usuario.local_id, nivel.id])
      .first();

    let progreso;

    if (existente) {
      progreso = {
        ...existente,
        completado: true,
        // Conservar el mejor resultado histórico
        estrellas: Math.max(existente.estrellas ?? 0, estrellas),
        // Usar el total de intentos real recibido
        intentos,
        ultimo_intento: new Date().toISOString(),
        sync_status: 'PENDIENTE',
        updated_at: new Date().toISOString(),
      };
    } else {
      progreso = {
        local_id: uuidv4(),
        // Puede ser null si el usuario aún no se sincronizó con el servidor.
        // syncService lo actualizará cuando el usuario se sincronice.
        usuario_id: usuario.id ?? null,
        usuario_local_id: usuario.local_id,
        nivel_id: nivel.id,
        completado: true,
        estrellas,
        intentos,
        ultimo_intento: new Date().toISOString(),
        sync_status: 'PENDIENTE',
        updated_at: new Date().toISOString(),
      };
    }

    // Guardar progreso en IndexedDB
    await db.progreso_usuarios.put(progreso);

    const entradaExistente = await db.cola_sincronizacion
      .where('estado')
      .equals('PENDIENTE')
      .filter((item) =>
        item.entidad === 'progreso_usuarios' &&
        item.datos?.local_id === progreso.local_id
      )
      .first();

    if (entradaExistente) {
      await db.cola_sincronizacion.put({
        ...entradaExistente,
        datos: progreso,
      });
    } else {
      await db.cola_sincronizacion.add({
        entidad: 'progreso_usuarios',
        accion: 'UPSERT',
        datos: progreso,
        estado: 'PENDIENTE',
      });
    }
  });
};