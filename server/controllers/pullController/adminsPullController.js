export const getAdminsPull = async (db, Op, lastSyncDate) => {
    return await db.Admin.findAll({
        where: {
            updated_at: { [Op.gt]: lastSyncDate }
        }
    });
};
