const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
    log: ["info", "warn", "error"],
});

process.on("SIGTERM", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

module.exports = prisma;