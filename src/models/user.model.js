const bcrypt = require("../utils/securite/bcrypt");
const prisma = require("../config/prisma.config");

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
        is_verified = false,
        created_at = null,
        updated_at = null,
        organisations = []
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.profile = profile;
        this.role = role;
        this.is_active = is_active;
        this.is_verified = is_verified;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.organisations = organisations;
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
            user.is_verified,
            user.created_at,
            user.updated_at,
            user.organisations || []
        );
    }

    static async getById(id) {
        try {
            const user = await prisma.user.findUnique({
                where: { id },
                include: { 
                    offres: true,
                    organisations: true
                }
            });
            return user ? User.fromPrisma(user) : null;
        } catch (error) {
            console.error(`Erreur dans User.getById(${id}):`, error);
            throw error;
        }
    }

    static async findByEmail(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
                include: { 
                    offres: true,
                    organisations: true
                }
            });
            return user ? User.fromPrisma(user) : null;
        } catch (error) {
            console.error(`Erreur dans User.findByEmail(${email}):`, error);
            throw error;
        }
    }

    static async getAll(skip = 0, take = 10) {
        try {
            const users = await prisma.user.findMany({
                skip,
                take,
                include: { 
                    offres: true,
                    organisations: true
                }
            });
            return users.map(User.fromPrisma);
        } catch (error) {
            console.error("Erreur dans User.getAll:", error);
            throw error;
        }
    }

    static async create(data) {
        try {
            if (data.password) {
                data.password = await bcrypt.hashPassword(data.password);
            }
            const newUser = await prisma.user.create({ 
                data: {
                    ...data,
                    organisations: data.organisations ? { connect: data.organisations.map(id => ({ id })) } : undefined
                }
            });
            return User.fromPrisma(newUser);
        } catch (error) {
            console.error("Erreur dans User.create:", error);
            throw error;
        }
    }

    static async update(id, data) {
        try {
            if (data.password) {
                data.password = await bcrypt.hashPassword(data.password);
            }
            const updatedUser = await prisma.user.update({
                where: { id },
                data: {
                    ...data,
                    organisations: data.organisations ? { set: data.organisations.map(id => ({ id })) } : undefined
                }
            });
            return User.fromPrisma(updatedUser);
        } catch (error) {
            console.error(`Erreur dans User.update(${id}):`, error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await prisma.user.delete({ where: { id } });
        } catch (error) {
            console.error(`Erreur dans User.delete(${id}):`, error);
            throw error;
        }
    }

    static async comparePassword(password, hashPassword) {
        return bcrypt.comparePassword(password, hashPassword);
    }
}

module.exports = User;