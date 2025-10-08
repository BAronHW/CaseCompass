FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN npm ci --only=production && npm cache clean --force

RUN npx prisma generate

EXPOSE 8000

CMD ["node", "dist/server.js"]