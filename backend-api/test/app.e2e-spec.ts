import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api/v1', { exclude: ['', 'health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Root & Health', () => {
    it('GET / returns service info', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('service', 'NestConnect API');
        });
    });

    it('GET /health returns ok', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('timestamp');
        });
    });
  });

  describe('Auth', () => {
    const base = '/api/v1/auth';
    const unique = `e2e-${Date.now()}`;
    const user = {
      name: 'E2E User',
      email: `${unique}@test.com`,
      password: 'password123',
    };

    it('POST /auth/signup creates user', () => {
      return request(app.getHttpServer())
        .post(`${base}/signup`)
        .send(user)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('user');
          expect(res.body.user).toHaveProperty('id');
          expect(res.body.user).toHaveProperty('name', user.name);
          expect(res.body.user).toHaveProperty('email', user.email);
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('refreshToken');
        });
    });

    it('POST /auth/signup duplicate email returns 409', () => {
      return request(app.getHttpServer())
        .post(`${base}/signup`)
        .send(user)
        .expect(409);
    });

    it('POST /auth/signin returns tokens', async () => {
      const res = await request(app.getHttpServer())
        .post(`${base}/signin`)
        .send({ email: user.email, password: user.password });
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('POST /auth/signin invalid password returns 401', () => {
      return request(app.getHttpServer())
        .post(`${base}/signin`)
        .send({ email: user.email, password: 'wrong' })
        .expect(401);
    });

    it('POST /auth/refresh-token returns new tokens', async () => {
      const signin = await request(app.getHttpServer())
        .post(`${base}/signin`)
        .send({ email: user.email, password: user.password });
      expect([200, 201]).toContain(signin.status);

      const res = await request(app.getHttpServer())
        .post(`${base}/refresh-token`)
        .send({ refreshToken: signin.body.refreshToken });
      expect([200, 201]).toContain(res.status);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
    });
  });

  describe('Users', () => {
    const base = '/api/v1/users';
    let token: string;

    beforeAll(async () => {
      const signup = await request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          name: 'E2E Users',
          email: `e2e-users-${Date.now()}@test.com`,
          password: 'password123',
        });
      token = signup.body.accessToken;
    });

    it('GET /users requires auth', () => {
      return request(app.getHttpServer()).get(base).expect(401);
    });

    it('GET /users returns list', () => {
      return request(app.getHttpServer())
        .get(base)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Friends', () => {
    const base = '/api/v1/friends';
    let tokenA: string;
    let tokenB: string;
    let userIdA: string;
    let userIdB: string;

    beforeAll(async () => {
      const ts = Date.now();
      const [resA, resB] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send({
            name: 'User A',
            email: `e2e-a-${ts}@test.com`,
            password: 'password123',
          }),
        request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send({
            name: 'User B',
            email: `e2e-b-${ts}@test.com`,
            password: 'password123',
          }),
      ]);
      tokenA = resA.body.accessToken;
      tokenB = resB.body.accessToken;
      userIdA = resA.body.user.id;
      userIdB = resB.body.user.id;
    });

    it('POST /friends/request sends request', () => {
      return request(app.getHttpServer())
        .post(`${base}/request`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ receiverId: userIdB })
        .expect(201);
    });

    it('GET /friends/requests/received returns pending', () => {
      return request(app.getHttpServer())
        .get(`${base}/requests/received`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('POST /friends/request/:id/accept accepts request', async () => {
      const received = await request(app.getHttpServer())
        .get(`${base}/requests/received`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);
      const requestId = received.body[0]?.id;
      expect(requestId).toBeDefined();

      const res = await request(app.getHttpServer())
        .post(`${base}/request/${requestId}/accept`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect([200, 201]).toContain(res.status);
    });

    it('GET /friends returns friend list', () => {
      return request(app.getHttpServer())
        .get(base)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('Chat', () => {
    const base = '/api/v1/chat';
    let tokenA: string;
    let tokenB: string;
    let userIdA: string;
    let userIdB: string;

    beforeAll(async () => {
      const ts = Date.now();
      const [resA, resB] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send({
            name: 'Chat A',
            email: `e2e-chat-a-${ts}@test.com`,
            password: 'password123',
          }),
        request(app.getHttpServer())
          .post('/api/v1/auth/signup')
          .send({
            name: 'Chat B',
            email: `e2e-chat-b-${ts}@test.com`,
            password: 'password123',
          }),
      ]);
      tokenA = resA.body.accessToken;
      tokenB = resB.body.accessToken;
      userIdA = resA.body.user.id;
      userIdB = resB.body.user.id;

      await request(app.getHttpServer())
        .post('/api/v1/friends/request')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ receiverId: userIdB });
      const received = await request(app.getHttpServer())
        .get('/api/v1/friends/requests/received')
        .set('Authorization', `Bearer ${tokenB}`);
      const reqId = received.body[0]?.id;
      if (reqId) {
        await request(app.getHttpServer())
          .post(`/api/v1/friends/request/${reqId}/accept`)
          .set('Authorization', `Bearer ${tokenB}`);
      }
    });

    it('POST /chat/messages sends message', () => {
      return request(app.getHttpServer())
        .post(`${base}/messages`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ receiverId: userIdB, content: 'Hello!' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('content', 'Hello!');
        });
    });

    it('GET /chat/conversation/:userId returns messages', () => {
      return request(app.getHttpServer())
        .get(`${base}/conversation/${userIdB}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });
});
