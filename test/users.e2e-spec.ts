import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { userMock } from './utils/userMock';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/users (POST)', () => {
    beforeEach(async () => {
      const uncleared = await request(app.getHttpServer()).get('/users');
      await Promise.all(
        uncleared.body.map(async (user: User) => {
          return request(app.getHttpServer()).delete(`/users/${user.id}`);
        }),
      );
    });

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
    beforeEach(async () => {
      const uncleared = await request(app.getHttpServer()).get('/users');
      await Promise.all(
        uncleared.body.map(async (user: User) => {
          return request(app.getHttpServer()).delete(`/users/${user.id}`);
        }),
      );
    });

    test('should get an empty array if no users are in the db', async () => {
      const response = await request(app.getHttpServer()).get('/users');
      expect(response.body).toEqual([]);
    });

    test('should get a user', async () => {
      const user = userMock();

      await request(app.getHttpServer()).post('/users').send(user).expect(201);
      const response = await request(app.getHttpServer()).get('/users');

      expect(response.body).not.toEqual([]);
      expect(response.body[0].email).toEqual(user.email);
    });
  });

  describe('/users/:id (GET)', () => {
    let user: User;

    beforeEach(async () => {
      const uncleared = await request(app.getHttpServer()).get('/users');
      await Promise.all(
        uncleared.body.map(async (user: User) => {
          return request(app.getHttpServer()).delete(`/users/${user.id}`);
        }),
      );
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
      const uncleared = await request(app.getHttpServer()).get('/users');
      await Promise.all(
        uncleared.body.map(async (user: User) => {
          return request(app.getHttpServer()).delete(`/users/${user.id}`);
        }),
      );
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
      expect(response.body.email).toBe('newEmail@test.com');
    });
  });

  describe('/users (DELETE)', () => {
    let userOne: User;
    let userTwo: User;

    beforeEach(async () => {
      const uncleared = await request(app.getHttpServer()).get('/users');
      await Promise.all(
        uncleared.body.map(async (user: User) => {
          return request(app.getHttpServer()).delete(`/users/${user.id}`);
        }),
      );
      const responseOne = await request(app.getHttpServer())
        .post('/users')
        .send(userMock())
        .expect(201);

      const responseTwo = await request(app.getHttpServer())
        .post('/users')
        .send({ email: 'secondUser@test.com', password: 'somePassword123' })
        .expect(201);
      userOne = responseOne.body;
      userTwo = responseTwo.body;
    });

    test('should delete one user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userOne.id}`)
        .expect(200);
    });

    test('should only affect deleted user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userOne.id}`)
        .expect(200);

      const response = await request(app.getHttpServer()).get('/users');

      expect(response.body[0].email).toEqual(userTwo.email);
    });
  });
});
