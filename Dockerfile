# Dockerfile
FROM node:18-alpine

WORKDIR /usr/src/app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe toutes les dépendances (dev incluses si besoin de Prisma)
RUN npm install

# Copie le reste de l'application
COPY . .

# Génère les fichiers Prisma si utilisés
RUN npx prisma generate

# Compile le projet si build requis (à adapter)
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]

