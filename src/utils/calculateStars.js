export const calculateStars = (totalPreguntas, fallosTotal) => {
  const porcentaje = (totalPreguntas - fallosTotal) / totalPreguntas

  if (fallosTotal === 0) return 3 // Todas a primera vez
  if (porcentaje >= 0.5) return 2 // Al menos la mitad correctas a primera vez
  return 1
}