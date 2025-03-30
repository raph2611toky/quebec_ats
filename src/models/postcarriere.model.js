const prisma = require("../config/prisma.config");

const getFullImageUrl = (relativePath, base_url) => {
    if (!relativePath) return null;
    return `${base_url}${relativePath}`;
};

class PostCarriere {
    constructor(
        id,
        titre,
        contenu,
        images = [],
        organisation_id,
        created_at = null,
        updated_at = null,
        base_url = ""
    ) {
        this.id = id;
        this.titre = titre;
        this.contenu = contenu;
        this.images = images.map(image_url => getFullImageUrl(image_url, base_url));
        this.organisation_id = organisation_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(postCarriere, base_url = "") {
        return new PostCarriere(
            postCarriere.id,
            postCarriere.titre,
            postCarriere.contenu,
            postCarriere.images || [],
            postCarriere.organisation_id,
            postCarriere.created_at,
            postCarriere.updated_at,
            base_url
        );
    }

    static async getById(id, base_url="") {
        try {
            const postCarriere = await prisma.postCarriere.findUnique({
                where: { id },
                include: { organisation: true }
            });
            return postCarriere ? PostCarriere.fromPrisma(postCarriere, base_url) : null;
        } catch (error) {
            console.error(`Erreur dans PostCarriere.getById(${id}):`, error);
            throw error;
        }
    }

    static async getAll(base_url, skip = 0, take = 10) {
        try {
            const postCarieres = await prisma.postCarriere.findMany({
                skip,
                take,
                include: { organisation: true }
            });
            return postCarieres.map(PostCarriere.fromPrisma, base_url);
        } catch (error) {
            console.error("Erreur dans PostCarriere.getAll:", error);
            throw error;
        }
    }

    static async create(data, base_url="") {
        try {
            const newPostCarriere = await prisma.postCarriere.create({ data });
            return PostCarriere.fromPrisma(newPostCarriere, base_url);
        } catch (error) {
            console.error("Erreur dans PostCarriere.create:", error);
            throw error;
        }
    }

    static async update(id, data, base_url="") {
        try {
            const updatedPostCarriere = await prisma.postCarriere.update({
                where: { id },
                data
            });
            return PostCarriere.fromPrisma(updatedPostCarriere, base_url);
        } catch (error) {
            console.error(`Erreur dans PostCarriere.update(${id}):`, error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.postCarriere.delete({ where: { id } });
        } catch (error) {
            console.error(`Erreur dans PostCarriere.delete(${id}):`, error);
            throw error;
        }
    }

    static async getByOrganisation(organisationId, base_url="") {
        try {
            const postCarieres = await prisma.postCarriere.findMany({
                where: { organisation_id: organisationId }
            });
            return postCarieres.map(postcarriere => PostCarriere.fromPrisma(postcarriere, base_url));
        } catch (error) {
            console.error(`Erreur dans PostCarriere.getByOrganisation(${organisationId}):`, error);
            throw error;
        }
    }
    
}

module.exports = PostCarriere;