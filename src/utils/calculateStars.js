/**
 * Calcula estrellas basado en el porcentaje de preguntas correctas a primera vez.
 *
 * @param {number} totalPreguntas - Total de preguntas del nivel
 * @param {number} fallosTotal - Cuántas preguntas requirieron más de un intento
 * @returns {number} 1, 2 o 3 estrellas
 */
export const calculateStars = (totalPreguntas, fallosTotal) => {
  const correctasAPrimeraVez = totalPreguntas - fallosTotal
  const porcentaje = correctasAPrimeraVez / totalPreguntas

  if (porcentaje === 1) return 3 // 100% — todas a primera vez
  if (porcentaje >= 0.6) return 2 // 60-99% — al menos 3 de 5
  return 1 // menos del 60%
}