# NestConnect Backend API

**Project:** nestjs-react-typescript-friend-service

NestJS API – auth, users, friends, real-time chat. Port 4000.

**Start**
```bash
npm install
npx prisma migrate dev
npm run start:dev
```

**Stop & Restart**
```bash
# Stop: Ctrl+C in the terminal running the server
# Or kill by port:
lsof -ti:4000 | xargs kill -9

# Restart (ensure PORT from .env.dev is used):
npm run start:dev

# If port conflicts, run with explicit PORT:
PORT=4000 npm run start:dev
```

**Docker**
```bash
docker compose up -d

# Stop:
docker compose down
```

**Test**
```bash
# Signin (returns accessToken + refreshToken)
curl -X POST http://localhost:4000/api/v1/auth/signin -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Refresh token
curl -X POST http://localhost:4000/api/v1/auth/refresh-token -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your-refresh-token>"}'
```

Swagger: `http://localhost:4000/api`
