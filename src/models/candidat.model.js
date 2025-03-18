const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Candidat {
    constructor(id, email, nom, telephone, image, created_at, updated_at) {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.telephone = telephone || null;
        this.image = image;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(candidat) {
        return new Candidat(
            candidat.id,
            candidat.email,
            candidat.nom,
            candidat.telephone,
            candidat.image,
            candidat.created_at,
            candidat.updated_at
        );
    }

    static async create(data) {
        const newCandidat = await prisma.candidat.create({ data });
        return Candidat.fromPrisma(newCandidat);
    }

    static async getById(id) {
        const candidat = await prisma.candidat.findUnique({
            where: { id },
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidat ? Candidat.fromPrisma(candidat) : null;
    }

    static async findByEmail(email) {
        const candidat = await prisma.candidat.findUnique({
            where: { email },
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidat ? Candidat.fromPrisma(candidat) : null;
    }

    static async getAll() {
        const candidats = await prisma.candidat.findMany({
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidats.map(Candidat.fromPrisma);
    }

    static async update(id, data) {
        const updatedCandidat = await prisma.candidat.update({
            where: { id },
            data
        });
        return Candidat.fromPrisma(updatedCandidat);
    }

    static async delete(id) {
        await prisma.candidat.delete({ where: { id } });
        return true;
    }

    static async addReferent(candidatId, referentId) {
        await prisma.candidatReferent.create({
            data: {
                candidat_id: candidatId,
                referent_id: referentId
            }
        });
    }

    static async removeReferent(candidatId, referentId) {
        await prisma.candidatReferent.delete({
            where: {
                candidat_id_referent_id: {
                    candidat_id: candidatId,
                    referent_id: referentId
                }
            }
        });
    }
}

module.exports = Candidat;