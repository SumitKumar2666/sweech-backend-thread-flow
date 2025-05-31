import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    
    await app.init();
  });

  beforeEach(async () => {
    // Clean database before each test
    await prismaService.loginRecord.deleteMany();
    await prismaService.comment.deleteMany();
    await prismaService.post.deleteMany();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    const validUser = {
      id: 'test@example.com',
      password: 'password123!',
      username: '테스트유저',
    };

    describe('/api/auth/register (POST)', () => {
      it('should register a new user successfully', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send(validUser)
          .expect(201)
          .expect((res) => {
            expect(res.body).toHaveProperty('id', validUser.id);
            expect(res.body).toHaveProperty('username', validUser.username);
            expect(res.body).toHaveProperty('registeredAt');
            userId = res.body.id;
          });
      });

      it('should fail with invalid email format', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            ...validUser,
            id: 'invalid-email',
          })
          .expect(400);
      });

      it('should fail with weak password', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            ...validUser,
            password: 'weak',
          })
          .expect(400);
      });

      it('should fail with non-Korean username', () => {
        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send({
            ...validUser,
            username: 'English Name',
          })
          .expect(400);
      });

      it('should fail when user already exists', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(validUser)
          .expect(201);

        return request(app.getHttpServer())
          .post('/api/auth/register')
          .send(validUser)
          .expect(409);
      });
    });

    describe('/api/auth/login (POST)', () => {
      beforeEach(async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send(validUser);
      });

      it('should login successfully', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            id: validUser.id,
            password: validUser.password,
          })
          .expect(200)
          .expect((res) => {
            expect(res.body).toHaveProperty('accessToken');
            authToken = res.body.accessToken;
          });
      });

      it('should fail with invalid credentials', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            id: validUser.id,
            password: 'wrongpassword',
          })
          .expect(401);
      });

      it('should fail with non-existent user', () => {
        return request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            id: 'nonexistent@example.com',
            password: validUser.password,
          })
          .expect(401);
      });
    });
  });

  describe('Posts', () => {
    beforeEach(async () => {
      // Register and login user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          id: 'test@example.com',
          password: 'password123!',
          username: '테스트유저',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          id: 'test@example.com',
          password: 'password123!',
        });

      authToken = loginResponse.body.accessToken;
    });

    describe('/api/posts (POST)', () => {
      it('should create a post successfully', () => {
        return request(app.getHttpServer())
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'Test Post',
            content: 'This is a test post content.',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.title).toBe('Test Post');
          });
      });

      it('should fail without authentication', () => {
        return request(app.getHttpServer())
          .post('/api/posts')
          .send({
            title: 'Test Post',
            content: 'This is a test post content.',
          })
          .expect(401);
      });

      it('should fail with invalid title length', () => {
        return request(app.getHttpServer())
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: 'A'.repeat(31), // Too long
            content: 'Valid content',
          })
          .expect(400);
      });
    });

    describe('/api/posts (GET)', () => {
      beforeEach(async () => {
        // Create test posts
        for (let i = 1; i <= 5; i++) {
          await request(app.getHttpServer())
            .post('/api/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              title: `Test Post ${i}`,
              content: `Content for test post ${i}`,
            });
        }
      });

      it('should get post list with pagination', () => {
        return request(app.getHttpServer())
          .get('/api/posts?page=1&limit=3')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toHaveLength(3);
            expect(res.body.total).toBe(5);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(3);
            expect(res.body.totalPages).toBe(2);
          });
      });

      it('should get post list with default pagination', () => {
        return request(app.getHttpServer())
          .get('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toHaveLength(5);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(20);
          });
      });
    });
  });

  describe('Comments', () => {
    let postId: number;

    beforeEach(async () => {
      // Register and login user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          id: 'test@example.com',
          password: 'password123!',
          username: '테스트유저',
        });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          id: 'test@example.com',
          password: 'password123!',
        });

      authToken = loginResponse.body.accessToken;

      // Create a test post
      const postResponse = await request(app.getHttpServer())
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Post',
          content: 'This is a test post.',
        });

      postId = postResponse.body.data.id;
    });

    describe('/api/posts/:postId/comments (POST)', () => {
      it('should create a comment successfully', () => {
        return request(app.getHttpServer())
          .post(`/api/posts/${postId}/comments`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: 'This is a test comment.',
          })
          .expect(201)
          .expect((res) => {
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('id');
            expect(res.body.data.content).toBe('This is a test comment.');
          });
      });

      it('should fail with non-existent post', () => {
        return request(app.getHttpServer())
          .post('/api/posts/99999/comments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            content: 'This is a test comment.',
          })
          .expect(404);
      });
    });

    describe('/api/posts/:postId/comments (GET)', () => {
      beforeEach(async () => {
        // Create test comments
        for (let i = 1; i <= 15; i++) {
          await request(app.getHttpServer())
            .post(`/api/posts/${postId}/comments`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              content: `Test comment ${i}`,
            });
        }
      });

      it('should get comment list with cursor pagination', () => {
        return request(app.getHttpServer())
          .get(`/api/posts/${postId}/comments?limit=5`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toHaveLength(5);
            expect(res.body.hasMore).toBe(true);
            expect(res.body.nextCursor).toBeDefined();
          });
      });
    });
  });

  describe('Login Records', () => {
    beforeEach(async () => {
      // Register user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          id: 'test@example.com',
          password: 'password123!',
          username: '테스트유저',
        });

      // Login multiple times to create records
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({
            id: 'test@example.com',
            password: 'password123!',
          });
        
        if (i === 0) {
          authToken = response.body.accessToken;
        }
      }
    });

    describe('/api/login-records (GET)', () => {
      it('should get login records', () => {
        return request(app.getHttpServer())
          .get('/api/login-records')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.data.length).toBeGreaterThan(0);
            expect(res.body.data[0]).toHaveProperty('userId');
            expect(res.body.data[0]).toHaveProperty('ipAddress');
            expect(res.body.data[0]).toHaveProperty('loginAt');
            expect(res.body.data[0]).toHaveProperty('username');
          });
      });
    });

    describe('/api/login-records/rankings (GET)', () => {
      it('should get login rankings', () => {
        return request(app.getHttpServer())
          .get('/api/login-records/rankings')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeInstanceOf(Array);
            expect(res.body.totalUsers).toBeGreaterThan(0);
            expect(typeof res.body.totalUsers).toBe('number');
          });
      });
    });
  });
});
