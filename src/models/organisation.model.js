const prisma = require("../config/prisma.config");

class Organisation {
    constructor(
        id,
        nom,
        adresse = "",
        ville = "",
        users = [],
        offres = [],
        postcarieres = [],
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.nom = nom;
        this.adresse = adresse;
        this.ville = ville;
        this.users = users;
        this.offres = offres;
        this.postcarieres = postcarieres;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(organisation) {
        return new Organisation(
            organisation.id,
            organisation.nom,
            organisation.adresse,
            organisation.ville,
            organisation.users || [],
            organisation.offres || [],
            organisation.postcarieres || [],
            organisation.created_at,
            organisation.updated_at
        );
    }

    static async getById(id) {
        try {
            const organisation = await prisma.organisation.findUnique({
                where: { id },
                include: { 
                    users: true, 
                    offres: true, 
                    postcarieres: true 
                }
            });
            return organisation ? Organisation.fromPrisma(organisation) : null;
        } catch (error) {
            console.error(`Erreur dans Organisation.getById(${id}):`, error);
            throw error;
        }
    }

    static async getAll(skip = 0, take = 10) {
        try {
            const organisations = await prisma.organisation.findMany({
                skip,
                take,
                include: { 
                    users: true, 
                    offres: true, 
                    postcarieres: true 
                }
            });
            return organisations.map(Organisation.fromPrisma);
        } catch (error) {
            console.error("Erreur dans Organisation.getAll:", error);
            throw error;
        }
    }

    static async create(data) {
        try {
            const newOrganisation = await prisma.organisation.create({
                data: {
                    ...data,
                    users: data.users ? { connect: data.users.map(id => ({ id })) } : undefined
                }
            });
            return Organisation.fromPrisma(newOrganisation);
        } catch (error) {
            console.error("Erreur dans Organisation.create:", error);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            const updatedOrganisation = await prisma.organisation.update({
                where: { id },
                data: {
                    ...data,
                    users: data.users ? { set: data.users.map(id => ({ id })) } : undefined
                }
            });
            return Organisation.fromPrisma(updatedOrganisation);
        } catch (error) {
            console.error(`Erreur dans Organisation.update(${id}):`, error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.organisation.delete({ where: { id } });
        } catch (error) {
            console.error(`Erreur dans Organisation.delete(${id}):`, error);
            throw error;
        }
    }

    static async getOffresByOrganisation(id) {
        try {
            const organisation = await prisma.organisation.findUnique({
                where: { id },
                include: { offres: true }
            });
            return organisation ? organisation.offres : [];
        } catch (error) {
            console.error(`Erreur dans Organisation.getOffresByOrganisation(${id}):`, error);
            throw error;
        }
    }
    
}

module.exports = Organisation;