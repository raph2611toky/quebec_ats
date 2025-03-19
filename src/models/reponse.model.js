const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Reponse {
    constructor(id, label, is_true, question_id, question = null) {
        this.id = id;
        this.label = label;
        this.is_true = is_true;
        this.question_id = question_id;
        this.question = question;
    }

    static fromPrisma(reponse) {
        const Question = require("./question.model"); // Import à l'intérieur
        return new Reponse(
            reponse.id,
            reponse.label,
            reponse.is_true,
            reponse.question_id,
            reponse.question ? Question.fromPrisma(reponse.question) : null
        );
    }

    static async getById(id) {
        const reponse = await prisma.reponse.findUnique({
            where: { id },
            include: { question: true },
        });
        return reponse ? Reponse.fromPrisma(reponse) : null;
    }

    static async getAll() {
        const reponses = await prisma.reponse.findMany({
            include: { question: true },
        });
        return reponses.map(Reponse.fromPrisma);
    }

    static async create(data) {
        const newReponse = await prisma.reponse.create({
            data,
            include: { question: true },
        });
        return Reponse.fromPrisma(newReponse);
    }

    static async update(id, data) {
        const updatedReponse = await prisma.reponse.update({
            where: { id },
            data,
            include: { question: true },
        });
        return Reponse.fromPrisma(updatedReponse);
    }

    static async delete(id) {
        return await prisma.reponse.delete({ where: { id } });
    }
}

module.exports = Reponse;