const { Role } = require("@prisma/client");
const User = require("../../src/models/user.model");

async function seedUsers() {
    try {
        const users = [
            { 
                name: "SuperAdmin1",
                email: "a.angelo.mada@gmail.com", 
                role: Role.ADMINISTRATEUR, 
                password: "password123",
                phone: "+261345992057",
                is_active: true, 
                is_verified: true
            },
            { 
                name: "SuperAdmin2",
                email: "morningstar25angelo@gmail.com", 
                role: Role.ADMINISTRATEUR, 
                password: "password123", 
                phone: "+261345992057",
                is_active: true, 
                is_verified: true 
            },
            { 
                name: "SuperAdmin3",
                email: "admin@example.com", 
                role: Role.ADMINISTRATEUR, 
                password: "password123", 
                phone: "+261345992057",
                is_active: true, 
                is_verified: true 
            },
            // { 
            //     name: "Moderateur",
            //     email: "moderator1@example.com", 
            //     role: Role.MODERATEUR, 
            //     password: "password123", 
            //     phone: "+261345992057",
            //     is_active: true, 
            //     is_verified: true 
            // },
            // { 
            //     name: "Moderateur",
            //     email: "moderator2@example.com", 
            //     role: Role.MODERATEUR, 
            //     password: "password123", 
            //     is_active: true, 
            //     is_verified: true,
            //     phone: "+261345992057",
            //     is_verified: true 
            // }
        ];

        for (const userData of users) {
            await User.create(userData);
        }

        console.log("Utilisateurs créés avec succès !");
    } catch (error) {
        console.error("Erreur dans seedUsers:", error);
    }
}

module.exports = seedUsers;
