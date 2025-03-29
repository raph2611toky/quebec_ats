const prisma = require("../config/prisma.config");


class Remarque {
    constructor(
        id,
        admin_id,
        postulation_id,
        text,
        created_at,
        updated_at
    ) {
        this.id = id;
        this.admin_id = admin_id;
        this.postulation_id = postulation_id;
        this.text = text;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(remarque) {
        return new Remarque(
            remarque.id,
            remarque.admin_id,
            remarque.postulation_id,
            remarque.text,
            remarque.created_at,
            remarque.updated_at
        );
    }

    static async create(data) {
        const newRemarque = await prisma.remarque.create({ data });
        return Remarque.fromPrisma(newRemarque);
    }

    static async getById(id) {
        const remarque = await prisma.remarque.findUnique({
            where: { id }
        });
        return remarque ? Remarque.fromPrisma(remarque) : null;
    }

    static async getAll() {
        const remarques = await prisma.remarque.findMany({});
        return remarques.map(remarque => Remarque.fromPrisma(remarque));
    }

    static async update(id, data) {
        const updatedRemarque = await prisma.remarque.update({
            where: { id },
            data
        });
        return Remarque.fromPrisma(updatedRemarque);
    }

    static async delete(id) {
        await prisma.remarque.delete({ where: { id } });
        return true;
    }
}

module.exports = Remarque;