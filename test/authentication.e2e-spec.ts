import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

import * as cookieParser from 'cookie-parser';
import { cookieExtractor } from './utils/cookieExtractor';
import * as jwt from 'jsonwebtoken';

export const userMock = () => ({
  email: `${Date.now()}@example.com`,
  password: 'somePassword123',
});

describe('AuthenticationController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
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

  describe('register', () => {
    it('should register a new user', async () => {
      //arrange
      const user = userMock();

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //assert
      expect(sut.body).toBeDefined();
      expect(sut.body.password).not.toBeDefined();
      expect(sut.body.email).toEqual(user.email);
    });

    it('should not allow two users with the same email', async () => {
      //arrange
      const user = userMock();
      const duplicatedMail = { ...user, password: 'otherpassword' };

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication')
        .send(duplicatedMail)
        .expect(400);

      //assert
      expect(sut.body.message).toBe('User with that email already exists');
    });
  });

  describe('log-in', () => {
    test('it should log in with correct credentials', async () => {
      //arrange
      const user = userMock();

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send(user)
        .expect(200);

      //assert
      expect(sut.body.email).toBe(user.email);
    });

    it('should warn wrong credentials if wrong mail is submitted', async () => {
      //arrange
      const user = userMock();

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send({ email: 'wrong@email.com', password: user.password })
        .expect(400);

      //assert
      expect(sut.body.message).toBe('Wrong credentials provided');
    });

    it('should warn wrong credentials if wrong password is submitted', async () => {
      //arrange
      const user = userMock();

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send({ email: user.email, password: 'wrongPassword' })
        .expect(400);

      //assert
      expect(sut.body.message).toBe('Wrong credentials provided');
    });

    it('should set an httpOnly cookie with a valid JWT', async () => {
      //arrange
      const user = userMock();

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send(user)
        .expect(200);

      //assert
      expect(sut.headers['set-cookie']).toBeDefined();
      const cookie = cookieExtractor(sut.headers['set-cookie']);
      expect(cookie.HttpOnly).toBeTruthy();
      const decodedJwt = jwt.decode(cookie.Authentication) as jwt.JwtPayload;
      expect(decodedJwt).toBeDefined();
      expect(decodedJwt.userId).toEqual(sut.body.id);
    });
  });

  describe('log-out', () => {
    //should do unit tests first
    //WIP
    it('should clear the jwt cookie', async () => {
      //arrange
      const user = userMock();

      await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      const loggedUser = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send(user)
        .expect(200);

      //act
      const sut = await request(app.getHttpServer())
        .post('/authentication/log-out')
        .send(user)
        .set('Cookie', `${loggedUser.headers['set-cookie']}`)
        .expect(200);

      //assert
      expect(sut.headers['set-cookie']).toBeDefined();
      const cookie = cookieExtractor(sut.headers['set-cookie']);
      expect(cookie.HttpOnly).toBeTruthy();
      expect(cookie).toEqual({
        Authentication: '',
        HttpOnly: true,
        Path: '/',
        'Max-Age': '0',
      });
    });
  });
});
