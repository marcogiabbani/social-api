import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';
import { postMock } from './utils/postMock';
import { userMock } from './authentication.e2e-spec';

describe('PostsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());

    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('A logged in user should be allowed to', () => {
    //session arrange
    let loggedInUser: any;
    let signedUpUser: any;
    let user: any;

    beforeEach(async () => {
      user = userMock();
      signedUpUser = await request(app.getHttpServer())
        .post('/authentication')
        .send(user)
        .expect(201);

      loggedInUser = await request(app.getHttpServer())
        .post('/authentication/log-in')
        .send({
          email: signedUpUser.body.email,
          password: user.password,
        })
        .expect(200);
    });

    test('create a post', async () => {
      //arrange
      const post = postMock();

      //act
      const sut = await request(app.getHttpServer())
        .post('/posts')
        .set('Cookie', loggedInUser.headers['set-cookie'][0])
        .send(post)
        .expect(201);

      //assert
      expect(sut.body.title).toBe(post.title);
      expect(sut.body.content).toBe(post.content);
      expect(sut.body.author.email).toBe(user.email);
      expect(sut.body.author.id).toBe(signedUpUser.body.id);
    });

    test('get all posts', async () => {
      //arrange
      const postList = [postMock(), postMock()];
      postList.forEach(
        async (post) =>
          await request(app.getHttpServer())
            .post('/posts')
            .set('Cookie', loggedInUser.headers['set-cookie'][0])
            .send(post)
            .expect(201),
      );

      //act
      const sut = await request(app.getHttpServer())
        .get('/posts')
        .set('Cookie', loggedInUser.headers['set-cookie'][0])
        .expect(200);

      //assert
      expect(sut.body).toBeInstanceOf(Array);
      expect(sut.body.length).toBeGreaterThanOrEqual(2);
      expect(sut.body[0]).toHaveProperty('title');
      expect(sut.body[0]).toHaveProperty('content');
    });

    describe('get post by id and', () => {
      test('get post if it exists', async () => {
        //arrange
        const post = postMock();

        const createdPost = await request(app.getHttpServer())
          .post('/posts')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(post)
          .expect(201);

        //act
        const sut = await request(app.getHttpServer())
          .get(`/posts/${createdPost.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(200);

        //assert
        expect(sut.body).toHaveProperty('id', createdPost.body.id);
        expect(sut.body).toHaveProperty('title', post.title);
        expect(sut.body).toHaveProperty('content', post.content);
      });

      test('alert if the post was not found', async () => {
        //arrange
        const mockId = 'non-existing-od';
        //act
        const sut = await request(app.getHttpServer())
          .get(`/posts/${mockId}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(404);

        //assert
        expect(sut.body.message).toEqual(`Post with ID ${mockId} not found`);
      });
    });

    /**
     * get post by id
     * edit a post
     * delete a post
     */
  });

  /**
   * Every user should be able to
   * get all posts
   * get post by id
   */

  /**
   * Without log in a user should not be able to
   * create a post
   * edit a post
   * delete a post
   */
});
