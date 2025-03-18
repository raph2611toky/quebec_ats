const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Offre {
    constructor(
        id,
        titre = "",
        user_id,
        image_url,
        description,
        date_limite,
        status,
        nombre_requis = 1,
        lieu,
        pays,
        type_emploi,
        salaire,
        devise,
        horaire_ouverture,
        horaire_fermeture,
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.titre = titre;
        this.user_id = user_id;
        this.image_url = image_url;
        this.description = description;
        this.date_limite = date_limite;
        this.status = status;
        this.nombre_requis = nombre_requis;
        this.lieu = lieu;
        this.pays = pays;
        this.type_emploi = type_emploi;
        this.salaire = salaire;
        this.devise = devise;
        this.horaire_ouverture = horaire_ouverture;
        this.horaire_fermeture = horaire_fermeture;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(offre) {
        return new Offre(
            offre.id,
            offre.titre,
            offre.user_id,
            offre.image_url,
            offre.description,
            offre.date_limite,
            offre.status,
            offre.nombre_requis,
            offre.lieu,
            offre.pays,
            offre.type_emploi,
            offre.salaire,
            offre.devise,
            offre.horaire_ouverture,
            offre.horaire_fermeture,
            offre.created_at,
            offre.updated_at
        );
    }

    static async getById(id) {
        const offre = await prisma.offre.findUnique({
            where: { id },
            include: { user: true, postulations: true }
        });
        return offre ? Offre.fromPrisma(offre) : null;
    }

    static async getAll() {
        const offres = await prisma.offre.findMany({
            include: { user: true, postulations: true }
        });
        return offres.map(Offre.fromPrisma);
    }

    static async create(data) {
        const newOffre = await prisma.offre.create({ data });
        return Offre.fromPrisma(newOffre);
    }

    static async update(id, data) {
        const updatedOffre = await prisma.offre.update({
            where: { id },
            data
        });
        return Offre.fromPrisma(updatedOffre);
    }

    static async delete(id) {
        return await prisma.offre.delete({ where: { id } });
    }
}

module.exports = Offre;