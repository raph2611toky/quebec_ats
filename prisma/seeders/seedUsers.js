const { Role } = require("@prisma/client");
const User = require("../../src/models/user.model");

async function seedUsers() {
    try {
        const users = [
            { 
                name: "Isaac Lamare",
                email: "isaac.lamare@gmail.com", 
                role: Role.ADMINISTRATEUR, 
                password: "password123",
                phone: "+14184316999",
                is_active: true, 
                is_verified: true
            },
            { 
                name: "SuperAdmin",
                email: "devcloudarmel@gmail.com", 
                role: Role.ADMINISTRATEUR, 
                password: "password123", 
                phone: "+14184316999",
                is_active: true, 
                is_verified: true 
            }
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
