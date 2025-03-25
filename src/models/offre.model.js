const { Status } = require("@prisma/client");
const prisma = require("../config/prisma.config");

const getFullImageUrl = (relativePath, base_url) => {
    if (!relativePath) return null;
    return `${base_url}${relativePath}`;
};

class Offre {
    constructor(
        id,
        titre = "",
        user_id,
        image_url,
        description,
        date_limite,
        status= Status.CREE,
        nombre_requis = 1,
        lieu,
        pays,
        type_emploi,
        salaire,
        devise,
        horaire_ouverture,
        horaire_fermeture,
        created_at = null,
        updated_at = null,
        base_url = ""
    ) {
        this.id = id;
        this.titre = titre;
        this.user_id = user_id;
        this.image_url = getFullImageUrl(image_url, base_url);
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

    static fromPrisma(offre, base_url = "") {
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
            offre.salaire.toString(),
            offre.devise,
            offre.horaire_ouverture,
            offre.horaire_fermeture,
            offre.created_at,
            offre.updated_at,
            base_url
        );
    }

    static async getById(id, base_url) {
        try {
            const offre = await prisma.offre.findUnique({
                where: { id },
                include: { user: true, postulations: true }
            });
            return offre ? Offre.fromPrisma(offre, base_url) : null;
        } catch (error) {
            console.error(`Erreur dans Offre.getById(${id}):`, error);
            throw error;
        }
    }

    static async getAll(base_url, skip = 0, take = 10) {
        try {
            const offres = await prisma.offre.findMany({
                skip,
                take,
                include: { user: true, postulations: true }
            });
            return offres.map(offre => Offre.fromPrisma(offre, base_url));
        } catch (error) {
            console.error("Erreur dans Offre.getAll:", error);
            throw error;
        }
    }

    static async getAllAvailable(base_url, skip = 0, take = 10) {
        try {
            const offres = await prisma.offre.findMany({
                skip,
                take,
                include: { user: true, postulations: true },
                where: { status: {not: Status.CREE}}
            });
            return offres.map(offre => Offre.fromPrisma(offre, base_url));
        } catch (error) {
            console.error("Erreur dans Offre.getAll:", error);
            throw error;
        }
    }


    static async create(data) {
        try {
            const newOffre = await prisma.offre.create({ data });
            return Offre.fromPrisma(newOffre, "");
        } catch (error) {
            console.error("Erreur dans Offre.create:", error);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const updatedOffre = await prisma.offre.update({
                where: { id },
                data
            });
            return Offre.fromPrisma(updatedOffre, "");
        } catch (error) {
            console.error(`Erreur dans Offre.update(${id}):`, error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.offre.delete({ where: { id } });
        } catch (error) {
            console.error(`Erreur dans Offre.delete(${id}):`, error);
            throw error;
        }
    }

    static async search(keyword, base_url) {
        try {
            const offres = await prisma.offre.findMany({
                where: {
                    status: Status.OUVERT,
                    OR: [
                        { titre: { contains: keyword, mode: "insensitive" } },
                        { description: { contains: keyword, mode: "insensitive" } }
                    ]
                }
            });
            return offres.map(offre => Offre.fromPrisma(offre, base_url));
        } catch (error) {
            console.error("Erreur dans Offre.search:", error);
            throw error;
        }
    }

}

module.exports = Offre;