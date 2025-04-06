const { PrismaClient, TypeProcessus } = require("@prisma/client");
const prisma = new PrismaClient();

class ReponsePreSelection {
    constructor(
        id,
        postulation_id,
        processus_id,
        question_id,
        reponse_id,
        url
    ) {
        this.id = id;
        this.postulation_id = postulation_id;
        this.processus_id = processus_id;
        this.question_id = question_id;
        this.reponse_id = reponse_id;
        this.url = url;
    }

    static fromPrisma(preselection) {
        return new ReponsePreSelection(
            preselection.id,
            preselection.postulation_id,
            preselection.processus_id,
            preselection.question_id,
            preselection.reponse_id,
            preselection.url,
        );
    }

    static async getById(id) {
        const preselection = await prisma.reponsePreSelection.findUnique({ 
            where: { id },
            include: {
                processus: {
                    include: true, 
                    select: {
                        type: true, titre: true, description: true
                    }
                },
                question: {
                    include: true,
                    select: {
                        label: true
                    }
                },
                reponse: {
                    include : true,
                    select: {
                        label: true, is_true: true
                    }
                }
            } 
        });

        if (!preselection) {
            return null;
        }

        return preselection ? ReponsePreSelection.fromPrisma(preselection) : null;
    }

    static async getAll() {
        const preselectionList = await prisma.preselection.findMany();
        return preselectionList.map(ReponsePreSelection.fromPrisma);
    }

    static async create(data) {
        const newPreSelection = await prisma.reponsePreSelection.create({ data });
        return ReponsePreSelection.fromPrisma(newPreSelection);
    }

    static async delete(id) {
        return await prisma.reponsePreSelection.delete({ where: { id } });
    }
}

module.exports = ReponsePreSelection;
