import { db } from '../../data/db';

/**
 * Genera la clave de configuración de racha para un usuario específico.
 * Cada usuario tiene su propia racha guardada en Dexie.
 */
const rachaKey = (usuarioLocalId) => `racha_${usuarioLocalId}`;

/**
 * Obtiene la racha actual del usuario desde Dexie.
 * Retorna 0 si no existe aún.
 */
export const obtenerRacha = async (usuarioLocalId) => {
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
 * Retorna la nueva racha para que el store pueda actualizarla en UI.
 */
export const actualizarRacha = async (usuarioLocalId, intentos) => {
  const rachaActual = await obtenerRacha(usuarioLocalId);

  const nuevaRacha = intentos === 1 ? rachaActual + 1 : 0;
  await db.configuracion.put({
    clave: rachaKey(usuarioLocalId),
    valor: nuevaRacha,
  });

  return nuevaRacha;
};