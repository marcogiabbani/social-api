import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '../categories.controller';
import { CategoriesService } from '../categories.service';
import { categoryMock } from './utils/categoryEntity.mock';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { postMock } from '../../posts/test/utils/postEntity.mock';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const categoriesServiceMock = {
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn().mockResolvedValue(categoryMock()),
    update: jest.fn().mockResolvedValue({
      affected: 1,
      raw: [],
    }),
    remove: jest.fn().mockResolvedValue({
      affected: 1,
      raw: [],
    }),
    modifyCategoryLink: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoriesService],
    })
      .overrideProvider(CategoriesService)
      .useValue(categoriesServiceMock)
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    describe('when create is called then', () => {
      test('it should return the category', async () => {
        //arrange
        const expected = categoryMock();
        const createCategoryDto: CreateCategoryDto = {
          name: expected.name,
        };

        //act
        const sut = await controller.create(createCategoryDto);

        //assert
        expect(sut).toEqual(expected);
        expect(categoriesServiceMock.create).toHaveBeenCalledWith(
          createCategoryDto,
        );
      });
    });
  });

  describe('findAll', () => {
    describe('when findAll is called then', () => {
      test('it should an array of posts', async () => {
        //arrange
        const expected = [categoryMock()];
        categoriesServiceMock.findAll.mockResolvedValue(expected);

        //act
        const sut = await controller.findAll();

        //assert
        expect(sut).toBe(expected);
        expect(categoriesServiceMock.findAll).toHaveBeenCalled();
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called then', () => {
      test('it should return the post', async () => {
        //arrange
        const expected = categoryMock();
        categoriesServiceMock.findOne.mockResolvedValue(expected);

        //act
        const sut = await controller.findOne(expected.id);

        //assert
        expect(sut).toBe(expected);
        expect(categoriesServiceMock.findOne).toHaveBeenCalledWith(expected.id);
      });
    });
  });

  describe('update', () => {
    describe('when update is called then', () => {
      test('it should return the post', async () => {
        //arrange
        const expected = categoryMock();

        const categoryToUpdate: UpdateCategoryDto = {
          name: 'New name',
        };

        //act
        const sut = await controller.update(expected.id, categoryToUpdate);

        //assert
        expect(sut.affected).toBe(1);
        expect(categoriesServiceMock.update).toHaveBeenCalledWith(
          expected.id,
          categoryToUpdate,
        );
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called then', () => {
      test('it should return the post', async () => {
        //arrange
        const expected = categoryMock();

        //act
        const sut = await controller.remove(expected.id);

        //assert
        expect(sut.affected).toBe(1);
        expect(categoriesServiceMock.remove).toHaveBeenCalledWith(expected.id);
      });
    });
  });

  describe('modifyCategoryLink', () => {
    describe('when modifyCategoryLink is called then', () => {
      test('it should call category service wiith valid postId and categoryId', async () => {
        //arrange
        const category = categoryMock();
        const post = postMock();

        //act
        controller.modifyCategoryLink(post.id, category.id);

        //assert
        expect(categoriesServiceMock.modifyCategoryLink).toHaveBeenCalledWith(
          post.id,
          category.id,
        );
      });
    });
  });
});
