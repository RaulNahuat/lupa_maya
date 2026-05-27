export async function getInsigniasPull(db) {
  const insigniasRaw = await db.Insignia.findAll();
  return insigniasRaw.map(i => i.toJSON());
}
