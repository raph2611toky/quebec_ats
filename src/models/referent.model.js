const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Referent {
    constructor(id, email, nom, telephone, recommendation, statut, created_at, updated_at) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.telephone = telephone;
        this.recommendation = recommendation || null;
        this.statut = statut;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(referent) {
        return new Referent(
            referent.id,
            referent.email,
            referent.nom,
            referent.telephone,
            referent.recommendation,
            referent.statut,
            referent.created_at,
            referent.updated_at
        );
    }

    static async create(data) {
        const newReferent = await prisma.referent.create({ data });
        return Referent.fromPrisma(newReferent);
    }

    static async getById(id) {
        const referent = await prisma.referent.findUnique({
            where: { id },
            include: { candidats: { include: { candidat: true } } }
        });
        return referent ? Referent.fromPrisma(referent) : null;
    }

    static async findByEmail(email) {
        const referent = await prisma.referent.findUnique({
            where: { email },
            include: { candidats: { include: { candidat: true } } }
        });
        return referent ? Referent.fromPrisma(referent) : null;
    }

    static async getAll() {
        const referents = await prisma.referent.findMany({
            include: { candidats: { include: { candidat: true } } }
        });
        return referents.map(Referent.fromPrisma);
    }

    static async update(id, data) {
        const updatedReferent = await prisma.referent.update({
            where: { id },
            data
        });
        return Referent.fromPrisma(updatedReferent);
    }

    static async delete(id) {
        await prisma.referent.delete({ where: { id } });
        return true;
    }
}

module.exports = Referent;