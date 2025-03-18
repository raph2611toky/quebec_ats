const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class Notification {
    constructor(
        id,
        titre,
        contenu,
        est_lu,
        created_at,
        updated_at
    ) {
        this.id = id;
        this.titre = titre;
        this.contenu = contenu;
        this.est_lu = est_lu;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(notification) {
        return new Notification(
            notification.id,
            notification.titre,
            notification.contenu,
            notification.est_lu,
            notification.created_at,
            notification.updated_at
        );
    }

    static async create(data) {
        const newNotification = await prisma.notification.create({ data });
        return Notification.fromPrisma(newNotification);
    }

    static async getById(id) {
        const notification = await prisma.notification.findUnique({
            where: { id }
        });
        return notification ? Notification.fromPrisma(notification) : null;
    }

    static async getAll() {
        const notifications = await prisma.notification.findMany();
        return notifications.map(Notification.fromPrisma);
    }

    static async update(id, data) {
        const updatedNotification = await prisma.notification.update({
            where: { id },
            data
        });
        return Notification.fromPrisma(updatedNotification);
    }

    static async changeEnDejaLu(id) {
        const updatedNotification = await prisma.notification.update({
            where: { id },
            data: { est_lu: true }
        });
        return Notification.fromPrisma(updatedNotification);
    }

    static async delete(id) {
        await prisma.notification.delete({ where: { id } });
        return true;
    }
}

module.exports = Notification;