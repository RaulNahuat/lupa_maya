export async function getGlifosPull(db, Op, lastSyncDate) {
  try {
    const esFirstSync = lastSyncDate.getTime() === 0;

    const glifos = await db.Glifo.findAll({
      where: {
        ...(esFirstSync ? {} : { updated_at: { [Op.gt]: lastSyncDate } })
      },
      include: [{
        model: db.GrupoNivel,
        as: 'grupo',
        attributes: ['dificultad']
      }]
    });

    return glifos.map(g => {
      const json = g.toJSON();
      return {
        ...json,
        level: json.grupo?.dificultad || 'BÁSICO'
      };
    });
  } catch (error) {
    console.error("Error fetching glifos for pull:", error);
    return [];
  }
}

