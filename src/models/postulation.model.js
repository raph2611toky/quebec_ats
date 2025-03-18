const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getFullUrl = (relativePath, baseUrl) => {
    if (!relativePath) return null;
    return `${baseUrl}${relativePath}`;
};

class Postulation {
    constructor(
        id,
        candidat_id,
        offre_id,
        date_soumission,
        etape_actuelle,
        cv,
        lettre_motivation,
        telephone,
        source_site,
        created_at,
        updated_at,
        baseUrl = ""
    ) {
        this.id = id;
        this.candidat_id = candidat_id;
        this.offre_id = offre_id;
        this.date_soumission = date_soumission;
        this.etape_actuelle = etape_actuelle;
        this.cv = getFullUrl(cv, baseUrl);
        this.lettre_motivation = getFullUrl(lettre_motivation, baseUrl);
        this.telephone = telephone || null;
        this.source_site = source_site;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(postulation, baseUrl = "") {
        return new Postulation(
            postulation.id,
            postulation.candidat_id,
            postulation.offre_id,
            postulation.date_soumission,
            postulation.etape_actuelle,
            postulation.cv, 
            postulation.lettre_motivation,
            postulation.telephone,
            postulation.source_site,
            postulation.created_at,
            postulation.updated_at,
            baseUrl 
        );
    }

    static async create(data) {
        const newPostulation = await prisma.postulation.create({ data });
        return Postulation.fromPrisma(newPostulation, "");
    }

    static async getById(id, baseUrl) {
        const postulation = await prisma.postulation.findUnique({
            where: { id },
            include: { candidat: { include: { referents: { include: { referent: true } } } }, offre: true }
        });
        return postulation ? Postulation.fromPrisma(postulation, baseUrl) : null;
    }

    static async getAll(baseUrl) {
        const postulations = await prisma.postulation.findMany({
            include: { candidat: { include: { referents: { include: { referent: true } } } }, offre: true }
        });
        return postulations.map(postulation => Postulation.fromPrisma(postulation, baseUrl));
    }

    static async update(id, data) {
        const updatedPostulation = await prisma.postulation.update({
            where: { id },
            data
        });
        return Postulation.fromPrisma(updatedPostulation, "");
    }

    static async delete(id) {
        await prisma.postulation.delete({ where: { id } });
        return true;
    }
}

module.exports = Postulation;