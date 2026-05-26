export async function getActiveAiModel(req, res, db) {
  try {
    const activeModel = await db.AiModel.findOne({
      where: { is_active: true },
      order: [["updated_at", "DESC"]]
    });

    if (!activeModel) {
      return res.status(404).json({ success: false, message: "No hay un modelo activo" });
    }

    return res.json({ success: true, data: activeModel });
  } catch (error) {
    console.error("Error al obtener el modelo AI activo:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}