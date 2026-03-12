# NestConnect Backend API

NestJS API – auth, users, friends, real-time chat. Port 4000.

**Start**
```bash
npm install
npx prisma migrate dev
npm run start:dev
```

**Docker**
```bash
docker compose up -d
```

**Test**
```bash
curl -X POST http://localhost:4000/api/v1/auth/signin -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Swagger: `http://localhost:4000/api`
