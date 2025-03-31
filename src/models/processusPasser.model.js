const prisma = require("../config/prisma.config");


class ProcessusPasser {
    constructor(
        id,
        processus_id,
        postulation_id,
        statut,
        score,
        lien_web,
        lien_fichier,
        lien_visio,
        created_at,
        updated_at
    ) {
        this.id = id;
        this.processus_id = processus_id;
        this.postulation_id = postulation_id;
        this.statut = statut;
        this.score = score;
        this.lien_web = lien_web;
        this.lien_fichier = lien_fichier;
        this.lien_visio = lien_visio;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(processusPasser) {
        return new ProcessusPasser(
            processusPasser.id,
            processusPasser.processus_id,
            processusPasser.postulation_id,
            processusPasser.statut,
            processusPasser.score,
            processusPasser.lien_web,
            processusPasser.lien_fichier,
            processusPasser.lien_visio,
            processusPasser.created_at,
            processusPasser.updated_at
        );
    }

    static async create(data) {
        const newProcessusPasser = await prisma.create({ data });
        return ProcessusPasser.fromPrisma(newProcessusPasser);
    }

    static async getById(id) {
        const processusPasser = await prisma.processusPasser.findUnique({
            where: { id }
        });
        return processusPasser ? ProcessusPasser.fromPrisma(processusPasser) : null;
    }

    static async getAll() {
        const processusPassers = await prisma.processusPasser.findMany({});
        return processusPassers.map(processusPasser => ProcessusPasser.fromPrisma(processusPasser));
    }

    static async update(id, data) {
        const updatedProcessusPasser = await prisma.processusPasser.update({
            where: { id },
            data
        });
        return ProcessusPasser.fromPrisma(updatedProcessusPasser);
    }

    static async delete(id) {
        await prisma.processusPasser.delete({ where: { id } });
        return true;
    }
}

module.exports = ProcessusPasser;