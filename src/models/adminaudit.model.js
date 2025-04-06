const prisma = require("../config/prisma.config");

class AdminAudit {
    constructor(
        id,
        admin_id,
        action,
        label,
        created_at
    ) {
        this.id = id;
        this.admin_id = admin_id;
        this.action = action;
        this.label = label;
        this.created_at = created_at;
    }

    static fromPrisma(adminAudit) {
        return new AdminAudit(
            adminAudit.id,
            adminAudit.admin_id,
            adminAudit.action,
            adminAudit.label,
            adminAudit.created_at
        );
    }

    static async create(admin_id,action,label) {
        data = {
            admin_id, action,label
        }
        const newAudit = await prisma.adminAudit.create({ data });
        return AdminAudit.fromPrisma(newAudit);
    }

    static async getById(id) {
        const audit = await prisma.adminAudit.findUnique({
            where: { id },
            include: {
                admin: true
            }            
        });
        return audit ? AdminAudit.fromPrisma(audit) : null;
    }

    static async getAll() {
        const audits = await prisma.adminAudit.findMany();
        return audits.map(AdminAudit.fromPrisma);
    }


    static async delete(id) {
        await prisma.adminAudit.delete({ where: { id } });
        return true;
    }
}

module.exports = AdminAudit;