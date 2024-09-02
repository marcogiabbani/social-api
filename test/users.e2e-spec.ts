import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { userMock } from './utils/userMock';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    beforeEach(async () => {});

    test('should post a user successfully', async () => {
      const user = userMock();
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);
      expect(response.body).toBeDefined();
      expect(response.body.email).toBe(user.email);
      expect(response.body.password).toBe(user.password);
    });
  });

  describe('/users (GET)', () => {
    beforeEach(async () => {});

    test('should get a user array', async () => {
      const user = userMock();

      await request(app.getHttpServer()).post('/users').send(user).expect(201);
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.body).not.toEqual([]);
      expect(response.body[0]).toHaveProperty('email');
    });
  });

  describe('/users/:id (GET)', () => {
    let user: User;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userMock())
        .expect(201);
      user = response.body;
    });

    test('should get a user by id', async () => {
      const response = await request(app.getHttpServer()).get(
        `/users/${user.id}`,
      );
      expect(response.body).toBeDefined();
      expect(response.body).toEqual(user);
    });
  });

  describe('/users (PATCH)', () => {
    let user: User;

    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userMock())
        .expect(201);
      user = response.body;
    });

    test('should update an existing user', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${user.id}`)
        .send({ email: 'newEmail@test.com' });
      expect(response.body.email).not.toBe(user.email);
      expect(response.body.email).toEqual('newEmail@test.com');
    });
  });

  describe('/users (DELETE)', () => {
    let userOne: User;
    let userTwo: User;

    test('should delete one user', async () => {
      const user = userMock();

      const responseOne = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);

      userOne = responseOne.body;

      await request(app.getHttpServer())
        .delete(`/users/${userOne.id}`)
        .expect(200);
    });

    test('should only affect deleted user', async () => {
      const user = userMock();

      const responseOne = await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201);

      const responseTwo = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'secondUser2@test.com', password: 'somePassword123' })
        .expect(201);

      userOne = responseOne.body;
      userTwo = responseTwo.body;

      await request(app.getHttpServer())
        .delete(`/users/${userOne.id}`)
        .expect(200);

      const response = await request(app.getHttpServer()).get(
        `/users/${userTwo.id}`,
      );

      expect(response.body.email).toEqual(userTwo.email);
    });
  });
});
