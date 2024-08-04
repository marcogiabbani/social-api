import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Repository } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { userMock } from './userMock';

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

  describe('/users (GET)', () => {
    beforeEach(async () => {
      await userRepository.clear();
    });
    test('should get an empty array if no users are in the db', async () => {
      const response = await request(app.getHttpServer()).get('/users');
      expect(response.body).toEqual([]);
    });

    test('should post a user succesfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userMock);
      expect(response.body).toBeDefined();
    });
  });
});
