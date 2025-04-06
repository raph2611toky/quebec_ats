const {comparePassword, hashPassword} = require("../utils/securite/bcrypt");
const prisma = require("../config/prisma.config");

class User {
    constructor(
        id,
        name,
        email,
        password,
        phone="",
        profile = "profile.png",
        role = "MODERATEUR",
        is_active = false,
        is_verified = false,
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
        this.is_verified = is_verified;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static fromPrisma(user, details = false) {
        const baseUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profile: user.profile,
            role: user.role,
            is_active: user.is_active,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at
        };

        if (details) {
            return {
                ...baseUser,
                organisations: user.organisations || [],
                offres: user.offres || [],
                otp_verfication: user.otp_verfication || [],
                remarques: user.remarques || [],
                invitations_sent: user.invitations_sent || []
            };
        }

        return baseUser;
    }

    static async getById(id, details = false) {
        try {
            const include = details ? {
                offres: true,
                organisations: true,
                remarques: true,
                invitations_sent: true,
                otp_verfication: true
            } : {};

            const user = await prisma.user.findUnique({
                where: { id },
                include
            });
            
            return user ? User.fromPrisma(user, details) : null;
        } catch (error) {
            console.error(`Erreur dans User.getById(${id}):`, error);
            throw error;
        }
    }

    static async findByEmail(email, details = false) {
        try {
            const include = details ? {
                offres: true,
                organisations: true,
                remarques: true,
                invitations_sent: true,
                otp_verfication: true
            } : {};

            const user = await prisma.user.findUnique({
                where: { email },
                include
            });
            return user ? User.fromPrisma(user, details) : null;
        } catch (error) {
            console.error(`Erreur dans User.findByEmail(${email}):`, error);
            throw error;
        }
    }

    static async getAll(skip = 0, take = 10, details = false) {
        try {
            const include = details ? {
                offres: true,
                organisations: true,
                remarques: true,
                invitations_sent: true,
                otp_verfication: true
            } : {};

            const users = await prisma.user.findMany({
                skip,
                take,
                include
            });
            return users.map(user => User.fromPrisma(user, details));
        } catch (error) {
            console.error("Erreur dans User.getAll:", error);
            throw error;
        }
    }

    static async getAlladmin(skip = 0, take = 10, details = false) {
        try {
            const include = details ? {
                offres: true,
                organisations: true,
                remarques: true,
                invitations_sent: true,
                otp_verfication: true
            } : {};

            const admins = await prisma.user.findMany({
                where: { role: "ADMINISTRATEUR" },
                skip,
                take,
                include
            });
            return admins.map(user => User.fromPrisma(user, details));
        } catch (error) {
            console.error("Erreur dans User.getAlladmin:", error);
            throw error;
        }
    }

    static async create(data) {
        try {
            if (data.password) {
                data.password = await hashPassword(data.password);
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
                data.password = await hashPassword(data.password);
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
        return comparePassword(password, hashPassword);
    }
}

module.exports = User;
