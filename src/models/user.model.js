const bcrypt = require("../utils/securite/bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class User {
    constructor(
        id,
        name,
        email,
        password,
        phone,
        profile = "profile.png",
        role = "MODERATEUR",
        is_active = false,
        created_at = null,
        updated_at = null
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.profile = profile;
        this.role = role;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(user) {
        return new User(
            user.id,
            user.name,
            user.email,
            user.password,
            user.phone,
            user.profile,
            user.role,
            user.is_active,
            user.created_at,
            user.updated_at
        );
    }

    static async getById(id) {
        const user = await prisma.user.findUnique({
            where: { id },
            include: { offres: true } // Inclut les offres associées
        });
        return user ? User.fromPrisma(user) : null;
    }

    static async findByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { offres: true }
        });
        return user ? User.fromPrisma(user) : null;
    }

    static async getAll() {
        const users = await prisma.user.findMany({
            include: { offres: true }
        });
        return users.map(User.fromPrisma);
    }

    static async create(data) {
        if (data.password) {
            data.password = await bcrypt.hashPassword(data.password);
        }
        const newUser = await prisma.user.create({ data });
        return User.fromPrisma(newUser);
    }

    static async update(id, data) {
        if (data.password) {
            data.password = await bcrypt.hashPassword(data.password);
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data
        });
        return User.fromPrisma(updatedUser);
    }

    static async delete(id) {
        return await prisma.user.delete({ where: { id } });
    }

    static async comparePassword(password, hashPassword) {
        return bcrypt.comparePassword(password, hashPassword);
    }
}

module.exports = User;