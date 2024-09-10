import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './../src/app.module';
import { categoryMock } from './utils/categoryMock';
import { userMock } from './utils/userMock';

describe('PostsController (e2e)', () => {
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

  describe('Tests', () => {
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

    describe('A logged in user should be allowed to', () => {
      test('create a category', async () => {
        //arrange
        const category = categoryMock();

        //act
        const sut = await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(201);

        //assert
        expect(sut.body.name).toBe(category.name);
      });

      test('be warned if the category name is already used', async () => {
        //arrange
        const category = { name: 'Category name' };
        await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(201);

        //act
        const sut = await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(400);

        //assert
        expect(sut.body.message).toBe('Category with than name already exists');
      });

      test('get all categories', async () => {
        //arrange
        const categoryList = [{ name: 'cat 1' }, { name: ' cat 2' }];
        categoryList.forEach(
          async (category) =>
            await request(app.getHttpServer())
              .post('/categories')
              .set('Cookie', loggedInUser.headers['set-cookie'][0])
              .send(category)
              .expect(201),
        );

        //act
        const sut = await request(app.getHttpServer())
          .get('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(200);

        //assert
        expect(sut.body).toBeInstanceOf(Array);
        expect(sut.body.length).toBeGreaterThanOrEqual(2);
        expect(sut.body[0]).toHaveProperty('name');
      });

      test('get category if it exists', async () => {
        //arrange
        const category = categoryMock();

        const createdCategory = await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(201);

        //act
        const sut = await request(app.getHttpServer())
          .get(`/categories/${createdCategory.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(200);

        //assert
        expect(sut.body).toHaveProperty('id', createdCategory.body.id);
        expect(sut.body).toHaveProperty('name', category.name);
      });

      test('be alerted if the category was not found', async () => {
        //arrange
        const mockId = 'edbc7455-ee7d-4fd0-a008-792c737ed699';

        //act
        const sut = await request(app.getHttpServer())
          .get(`/categories/${mockId}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(404);

        //assert
        expect(sut.body.message).toEqual(
          `Category with ID ${mockId} not found`,
        );
      });

      test('edit a category', async () => {
        //arrange
        const category = categoryMock();

        const createdCategory = await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(201);

        //act
        await request(app.getHttpServer())
          .patch(`/categories/${createdCategory.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send({ name: 'New name' })
          .expect(200);

        const sut = await request(app.getHttpServer())
          .get(`/categories/${createdCategory.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0]);

        //assert
        expect(sut.body.name).not.toBe(createdCategory.body.name);
        expect(sut.body.name).toEqual('New name');
      });

      test('delete a category', async () => {
        //arrange
        const category = categoryMock();

        const createdCategory = await request(app.getHttpServer())
          .post('/categories')
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .send(category)
          .expect(201);

        //act
        const response = await request(app.getHttpServer())
          .delete(`/categories/${createdCategory.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0])
          .expect(200);

        const sut = await request(app.getHttpServer())
          .get(`/categories/${createdCategory.body.id}`)
          .set('Cookie', loggedInUser.headers['set-cookie'][0]);

        //assert
        expect(response.body.affected).toBe(1);
        expect(sut.body.message).toEqual(
          `Category with ID ${createdCategory.body.id} not found`,
        );
      });
    });

    describe('Every user should be able to', () => {
      beforeEach(async () => {
        const categoryList = [
          { name: `Public cat 1 #${Date.now()}` },
          { name: `Public cat 2 #${Date.now()}` },
        ];
        categoryList.forEach(
          async (category) =>
            await request(app.getHttpServer())
              .post('/categories')
              .set('Cookie', loggedInUser.headers['set-cookie'][0])
              .send(category)
              .expect(201),
        );
      });

      test('get all categories', async () => {
        //act
        const sut = await request(app.getHttpServer())
          .get('/categories')
          .expect(200);

        //assert
        expect(sut.body).toBeInstanceOf(Array);
        expect(sut.body.length).toBeGreaterThanOrEqual(2);
        expect(sut.body[0]).toHaveProperty('name');
      });

      test('get a category by id', async () => {
        //arrange
        const category = await request(app.getHttpServer())
          .get('/categories')
          .expect(200);

        const expectedCategory = category.body[0];

        //act
        const sut = await request(app.getHttpServer())
          .get(`/categories/${expectedCategory.id}`)
          .expect(200);

        //assert
        expect(sut.body.name).toEqual(expectedCategory.name);
      });
    });

    describe('Without login, users should not be able to', () => {
      test('create a category', async () => {
        //arrange
        const category = categoryMock();

        //act
        const sut = await request(app.getHttpServer())
          .post('/categories')
          .send(category)
          .expect(401);

        //assert
        expect(sut.body.message).toBe('Unauthorized');
      });

      test('edit a category', async () => {
        //arrange
        const categories = await request(app.getHttpServer()).get(
          `/categories`,
        );

        //act
        //assuming there are categories from previous test,
        //because clean up is only done at setup
        const sut = await request(app.getHttpServer())
          .patch(`/categories/${categories.body[0].id}`)
          .send({ title: 'New title' })
          .expect(401);

        //assert
        expect(sut.body.message).toBe('Unauthorized');
      });

      test('delete a category', async () => {
        //arrange
        const categories = await request(app.getHttpServer()).get(
          `/categories`,
        );

        //act
        //assuming there are categories from previous test,
        //because clean up is only done at setup
        const sut = await request(app.getHttpServer())
          .delete(`/categories/${categories.body[0].id}`)
          .expect(401);

        //assert
        expect(sut.body.message).toBe('Unauthorized');
      });
    });
  });
});
