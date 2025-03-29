const prisma = require("../config/prisma.config");
const User = require("./user.model");
const Offre = require("./offre.model");

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
            organisation.users ? organisation.users.map(User.fromPrisma) : [],
            organisation.offres ? organisation.offres.map(Offre.fromPrisma) : [],
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
                    nom: data.nom, 
                    adresse: data.adresse, 
                    ville: data.ville,
                    users: {
                        connect: data.users.map(id => ({ id }))
                    },
                }
            });
            const organisation = await prisma.organisation.findUnique({
                where: { id: newOrganisation.id },
                include: { users: true }
            });
            return Organisation.fromPrisma(organisation);
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
            return organisation ? organisation.offres.map(Offre.fromPrisma) : [];
        } catch (error) {
            console.error(`Erreur dans Organisation.getOffresByOrganisation(${id}):`, error);
            throw error;
        }
    }

    static async getUsersByOrganisation(id) {
        try {
            const organisation = await prisma.organisation.findUnique({
                where: { id },
                include: { users: true }
            });
            return organisation ? organisation.users.map(User.fromPrisma) : [];
        } catch (error) {
            console.error(`Erreur dans Organisation.getUsersByOrganisation(${id}):`, error);
            throw error;
        }
    }

    static async getUniqueOrganisation(nom, ville, adresse) {
        try {
            const organisation = await prisma.organisation.findFirst({
                where: {
                    nom,
                    ville,
                    adresse
                }
            });
            return organisation ? Organisation.fromPrisma(organisation) : null;
        } catch (error) {
            console.error("Erreur dans Organisation.getUniqueOrganisation:", error);
            throw error;
        }
    }
}

module.exports = Organisation;
