const prisma = require("../config/prisma.config");

const getFullImageUrl = (relativePath, base_url) => {
    if (!relativePath) return null;
    return `${base_url}${relativePath}`;
};

class Candidat {
    constructor(id, email, nom, is_email_active, telephone, image, created_at, updated_at, base_url = "") {
        this.id = id;
        this.email = email;
        this.nom = nom;
        this.is_email_active = is_email_active;
        this.telephone = telephone || null;
        this.image = getFullImageUrl(image, base_url);
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(candidat, base_url = "") {
        return new Candidat(
            candidat.id,
            candidat.email,
            candidat.nom,
            candidat.is_email_active,
            candidat.telephone,
            candidat.image,
            candidat.created_at,
            candidat.updated_at,
            base_url
        );
    }

    static async create(data, base_url = "") {
        const newCandidat = await prisma.candidat.create({ data });
        return Candidat.fromPrisma(newCandidat, base_url);
    }

    static async getById(id, base_url = "") {
        const candidat = await prisma.candidat.findUnique({
            where: { id },
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidat ? Candidat.fromPrisma(candidat, base_url) : null;
    }

    static async findByEmail(email, base_url = "") {
        const candidat = await prisma.candidat.findUnique({
            where: { email },
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidat ? Candidat.fromPrisma(candidat, base_url) : null;
    }

    static async getAll(base_url = "") {
        const candidats = await prisma.candidat.findMany({
            include: { referents: { include: { referent: true } }, postulations: true }
        });
        return candidats.map(candidat => Candidat.fromPrisma(candidat, base_url));
    }

    static async update(id, data, base_url = "") {
        const updatedCandidat = await prisma.candidat.update({
            where: { id },
            data
        });
        return Candidat.fromPrisma(updatedCandidat, base_url);
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

    static async getReferent(candidatId, referentId) {
        const relation = await prisma.candidatReferent.findUnique({
            where: {
                candidat_id_referent_id: {
                    candidat_id: candidatId,
                    referent_id: referentId
                }
            }
        });
        return relation;
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