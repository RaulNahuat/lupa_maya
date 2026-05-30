import { db } from '../../data/db';

/**
 * Genera la clave de configuración de racha para un usuario específico.
 * Cada usuario tiene su propia racha guardada en Dexie.
 */
const rachaKey = (usuarioLocalId) => `racha_${usuarioLocalId}`;

/**
 * Obtiene la racha actual del usuario.
 * Retorna 0 si no existe aún.
 */
export const obtenerRacha = async (usuarioLocalId) => {
  const usuario = await db.usuarios.get(usuarioLocalId);
  if (usuario?.racha !== undefined) return usuario.racha;

  const config = await db.configuracion.get(rachaKey(usuarioLocalId));
  return config?.valor ?? 0;
};

/**
 * Recalcula y guarda la racha del usuario tras completar un nivel.
 *
 * Reglas:
 *  - Si intentos === 1 → racha sube +1
 *  - Si intentos > 1  → racha se rompe y vuelve a 0
 *
 * Retorna la nueva racha.
 */
export const actualizarRacha = async (usuarioLocalId, aprobado, esPrimeraVez) => {
  const rachaActual = await obtenerRacha(usuarioLocalId);

  // Si es repetición de nivel, no modificar la racha
  if (!esPrimeraVez) return rachaActual

  const nuevaRacha = aprobado ? rachaActual + 1 : 0;
  
  await db.transaction('rw', db.usuarios, db.configuracion, db.cola_sincronizacion, async () => {

    // Actualizar en db.usuarios
    const usuario = await db.usuarios.get(usuarioLocalId);
    if (usuario) {
      await db.usuarios.put({
        ...usuario,
        racha: nuevaRacha,
        sync_status: 'PENDIENTE',
        updated_at: new Date().toISOString(),
      });
    }

    // Guardar en db.configuracion como respaldo offline
    await db.configuracion.put({
      clave: rachaKey(usuarioLocalId),
      valor: nuevaRacha,
    });

    // Encolar el usuario para que syncService lo suba al servidor
    const entradaExistente = await db.cola_sincronizacion
      .where('estado')
      .equals('PENDIENTE')
      .filter((item) =>
        item.entidad === 'usuarios' &&
        item.datos?.local_id === usuarioLocalId
      )
      .first();

    const datosUsuario = await db.usuarios.get(usuarioLocalId);

    if (entradaExistente) {
      await db.cola_sincronizacion.put({
        ...entradaExistente,
        datos: datosUsuario,
      });
    } else {
      await db.cola_sincronizacion.add({
        entidad: 'usuarios',
        accion: 'CREAR',
        datos: datosUsuario,
        estado: 'PENDIENTE',
      });
    }
  });

  return nuevaRacha;
};