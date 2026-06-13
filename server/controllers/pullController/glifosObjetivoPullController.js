export async function getGlifosObjetivoPull(db) {
  const raw = await db.NivelGlifoObjetivo.findAll({
    include: [{
      model: db.Glifo,
      as: 'glifo',
      attributes: ['id', 'nombre_maya', 'significado_es', 'descripcion', 'imagen_url', 'audio_url', 'video_url', 'clase_modelo']
    }]
  });

  return raw.map(g => g.toJSON());
}