FROM node:22

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

RUN mkdir -p /app/uploads

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]
# CMD ["sh", "-c", "node dist/seeder/seeder.js && node dist/main.js"]