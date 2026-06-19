export async function getGruposEscolaresPull(db, Op, lastSyncDate) {
  return await db.GrupoEscolar.findAll({
    raw: true
  });
}

export async function getGrupoEscolarGrupoNivelPull(db, Op, lastSyncDate) {
  return await db.GrupoEscolarGrupoNivel.findAll({
    raw: true
  });
}

export async function getUsuarioGrupoNivelPull(db, Op, lastSyncDate) {
  return await db.UsuarioGrupoNivel.findAll({
    raw: true
  });
}
