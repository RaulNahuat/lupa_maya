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
 * Obtiene la racha de escaneos actual del usuario.
 * Retorna 0 si no existe aún.
 */
export const obtenerRachaEscaneos = async (usuarioLocalId) => {
  const usuario = await db.usuarios.get(usuarioLocalId);
  if (usuario?.racha_escaneos !== undefined) return usuario.racha_escaneos;

  const config = await db.configuracion.get(`racha_escaneos_${usuarioLocalId}`);
  return config?.valor ?? 0;
};

/**
 * Recalcula y guarda la racha de niveles y la racha de escaneos del usuario tras completar un nivel.
 *
 * Reglas:
 *  - Si intentos === 1 → racha sube +1
 *  - Si intentos > 1  → racha se rompe y vuelve a 0
 *
 * Retorna un objeto { racha, racha_escaneos }.
 */
export const actualizarRacha = async (usuarioLocalId, aprobado, esPrimeraVez, nivel) => {
  const rachaActual = await obtenerRacha(usuarioLocalId);
  const rachaEscaneosActual = await obtenerRachaEscaneos(usuarioLocalId);

  // Si es repetición de nivel, no modificar las rachas
  if (!esPrimeraVez) {
    return { racha: rachaActual, racha_escaneos: rachaEscaneosActual };
  }

  const nuevaRacha = aprobado ? rachaActual + 1 : 0;
  
  // La racha de escaneos solo se actualiza si el nivel es de tipo 'BUSQUEDA' (escanear)
  let nuevaRachaEscaneos = rachaEscaneosActual;
  if (nivel?.tipo === 'BUSQUEDA') {
    nuevaRachaEscaneos = aprobado ? rachaEscaneosActual + 1 : 0;
  }

  await db.transaction('rw', db.usuarios, db.configuracion, db.cola_sincronizacion, async () => {

    // Actualizar en db.usuarios
    const usuario = await db.usuarios.get(usuarioLocalId);
    if (usuario) {
      await db.usuarios.put({
        ...usuario,
        racha: nuevaRacha,
        racha_escaneos: nuevaRachaEscaneos,
        sync_status: 'PENDIENTE',
        updated_at: new Date().toISOString(),
      });
    }

    // Guardar en db.configuracion como respaldo offline
    await db.configuracion.put({
      clave: rachaKey(usuarioLocalId),
      valor: nuevaRacha,
    });
    await db.configuracion.put({
      clave: `racha_escaneos_${usuarioLocalId}`,
      valor: nuevaRachaEscaneos,
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

  return { racha: nuevaRacha, racha_escaneos: nuevaRachaEscaneos };
};