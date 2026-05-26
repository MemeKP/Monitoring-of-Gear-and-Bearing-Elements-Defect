# Vibration Dashboard 

### Instructions:
- This project use pnpm as package manager tool.
```bash
pnpm install
```
```bash
pnpm run start:dev
```

### Setup Guide:
1. Copy file `.env.example` and rename as `.env`
```bash
cp .env.example .env
```
There're 2 .env files that must considered
- In frontend directory change VITE_API_URL to your domain
```bash 
VITE_API_URL=http://<YOUR_SERVER_IP>/api 
```
- In backend directory replace `localhost` with that server's actual IP address or domain name.
```bash
DB_HOST=<YOUR_SERVER_IP> 
REDIS_URL=redis://<YOUR_SERVER_IP>:6379
```

2. Start Container (using Docker)
```bash
docker-compose up -d 
```
On the first run, MySQL will automatically create the database and indexes from the init-scripts folder.

3. Start Backend (NestJS)
```bash
cd backend
pnpm install
pnpm run start:dev
```
4. Synchronize data with TypeSense (only need to do this the first time or when the data in the database changes).
```bash
Request POST http://localhost:3000/api/v1/equipments/sync-typesense
```
5. Start Frontend 
```bash
cd frontend
pnpm install
pnpm run dev
```