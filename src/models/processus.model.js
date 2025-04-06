const { PrismaClient, TypeProcessus } = require("@prisma/client");
const prisma = new PrismaClient();

class Processus {
    constructor(
        id,
        offre_id,
        titre,
        type = "VISIO_CONFERENCE",
        description,
        duree,
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.offre_id = offre_id;
        this.titre = titre;
        this.type = type;
        this.description = description;
        this.duree = duree;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(processus) {
        return new Processus(
            processus.id,
            processus.offre_id,
            processus.titre,
            processus.type,
            processus.description,
            processus.duree,
            processus.created_at,
            processus.updated_at
        );
    }

    static async getById(id) {
        const processus = await prisma.processus.findUnique({ 
            where: { id },
            include: {questions: true} 
        });

        if (!processus) {
            return null;
        }

        if (processus.type === TypeProcessus.QUESTIONNAIRE) {
            return {
                ...processus,
                questions: processus.questions 
            };
        }

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
