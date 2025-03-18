const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Processus {
    constructor(
        id,
        titre,
        type = "VISIO_CONFERENCE",
        description,
        statut = "A_VENIR",
        duree,
        lien_visio = null,
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.titre = titre;
        this.type = type;
        this.description = description;
        this.statut = statut;
        this.duree = duree;
        this.lien_visio = lien_visio;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(processus) {
        return new Processus(
            processus.id,
            processus.titre,
            processus.type,
            processus.description,
            processus.statut,
            processus.duree,
            processus.lien_visio,
            processus.created_at,
            processus.updated_at
        );
    }

    static async getById(id) {
        const processus = await prisma.processus.findUnique({ where: { id } });
        return processus ? Processus.fromPrisma(processus) : null;
    }

    static async getAll() {
        const processusList = await prisma.processus.findMany();
        return processusList.map(Processus.fromPrisma);
    }

    static async create(data) {
        const newProcessus = await prisma.processus.create({ data });
        return Processus.fromPrisma(newProcessus);
    }

    static async update(id, data) {
        const updatedProcessus = await prisma.processus.update({
            where: { id },
            data
        });
        return Processus.fromPrisma(updatedProcessus);
    }

    static async delete(id) {
        return await prisma.processus.delete({ where: { id } });
    }
}

module.exports = Processus;
