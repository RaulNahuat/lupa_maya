export async function getPreguntasPull(db, Op, lastSyncDate) {
  const preguntasRaw = await db.Pregunta.findAll({
    where: {
      activa: true,
      updated_at: { [Op.gt]: lastSyncDate }
    },
    include: [{
      model: db.Glifo,
      as: 'glifo',
      attributes: ['id', 'nombre_maya', 'significado_es', 'imagen_url', 'audio_url'],
      required: false
    }]
  });

  const preguntas = preguntasRaw.map(p => p.toJSON());

  // Si no hay preguntas nuevas, devolver arrays vacíos
  if (preguntas.length === 0) {
    return { preguntas: [], opciones_respuestas: [] };
  }

  // Traer todas las opciones de las preguntas descargadas
  const preguntaIds = preguntas.map(p => p.id);
  const opcionesRaw = await db.OpcionRespuesta.findAll({
    where: { preguntas_id: { [Op.in]: preguntaIds } }
  });

  return {
    preguntas,
    opciones_respuestas: opcionesRaw.map(o => o.toJSON())
  };
}