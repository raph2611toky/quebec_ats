const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Question {
    constructor(id, label, processus_id, reponses = [], processus = null) {
        this.id = id;
        this.label = label;
        this.processus_id = processus_id;
        this.reponses = reponses;
        this.processus = processus;
    }

    static fromPrisma(question) {
        const Reponse = require("./reponse.model"); // Import à l'intérieur
        const Processus = require("./processus.model"); // Import à l'intérieur
        return new Question(
            question.id,
            question.label,
            question.processus_id,
            question.reponses ? question.reponses.map(Reponse.fromPrisma) : [],
            question.processus ? Processus.fromPrisma(question.processus) : null
        );
    }

    static async getById(id) {
        const question = await prisma.question.findUnique({
            where: { id },
            include: { reponses: true, processus: true },
        });
        return question ? Question.fromPrisma(question) : null;
    }

    static async getAll() {
        const questions = await prisma.question.findMany({
            include: { reponses: true, processus: true },
        });
        return questions.map(Question.fromPrisma);
    }

    static async create(data) {
        const newQuestion = await prisma.question.create({
            data,
            include: { reponses: true, processus: true },
        });
        return Question.fromPrisma(newQuestion);
    }

    static async update(id, data) {
        const updatedQuestion = await prisma.question.update({
            where: { id },
            data,
            include: { reponses: true, processus: true },
        });
        return Question.fromPrisma(updatedQuestion);
    }

    static async delete(id) {
        return await prisma.question.delete({ where: { id } });
    }
}

module.exports = Question;