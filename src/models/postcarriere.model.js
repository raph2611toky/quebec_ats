const prisma = require("../config/prisma.config");

class PostCarriere {
    constructor(
        id,
        titre,
        contenu,
        images = [],
        organisation_id,
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.titre = titre;
        this.contenu = contenu;
        this.images = images;
        this.organisation_id = organisation_id;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(postCarriere) {
        return new PostCarriere(
            postCarriere.id,
            postCarriere.titre,
            postCarriere.contenu,
            postCarriere.images || [],
            postCarriere.organisation_id,
            postCarriere.created_at,
            postCarriere.updated_at
        );
    }

    static async getById(id) {
        try {
            const postCarriere = await prisma.postCarriere.findUnique({
                where: { id },
                include: { organisation: true }
            });
            return postCarriere ? PostCarriere.fromPrisma(postCarriere) : null;
        } catch (error) {
            console.error(`Erreur dans PostCarriere.getById(${id}):`, error);
            throw error;
        }
    }

    static async getAll(skip = 0, take = 10) {
        try {
            const postCarieres = await prisma.postCarriere.findMany({
                skip,
                take,
                include: { organisation: true }
            });
            return postCarieres.map(PostCarriere.fromPrisma);
        } catch (error) {
            console.error("Erreur dans PostCarriere.getAll:", error);
            throw error;
        }
    }

    static async create(data) {
        try {
            const newPostCarriere = await prisma.postCarriere.create({ data });
            return PostCarriere.fromPrisma(newPostCarriere);
        } catch (error) {
            console.error("Erreur dans PostCarriere.create:", error);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const updatedPostCarriere = await prisma.postCarriere.update({
                where: { id },
                data
            });
            return PostCarriere.fromPrisma(updatedPostCarriere);
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

    static async getByOrganisation(organisationId) {
        try {
            const postCarieres = await prisma.postCarriere.findMany({
                where: { organisation_id: organisationId }
            });
            return postCarieres.map(PostCarriere.fromPrisma);
        } catch (error) {
            console.error(`Erreur dans PostCarriere.getByOrganisation(${organisationId}):`, error);
            throw error;
        }
    }
    
}

module.exports = PostCarriere;