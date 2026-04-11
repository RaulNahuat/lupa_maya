export async function getGlifosObjetivoPull(db) {
  const raw = await db.NivelGlifoObjetivo.findAll({
    include: [{
      model: db.Glifo,
      as: 'glifo',
      attributes: ['id', 'nombre_maya', 'significado_es', 'imagen_url', 'audio_url']
    }]
  });

  return raw.map(g => g.toJSON());
}