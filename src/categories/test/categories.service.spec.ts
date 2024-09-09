import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from '../categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { categoryMock } from './utils/categoryEntity.mock';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { HttpException, HttpStatus } from '@nestjs/common';
import { categoryRepositoryMock } from './utils/categoryRepository.mock';
import { UpdateCategoryDto } from '../dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: categoryRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('when create is called', () => {
      const expected = categoryMock();
      const createCategoryDto: CreateCategoryDto = {
        name: expected.name,
      };

      jest.spyOn(categoryRepositoryMock, 'create').mockReturnValue(expected);
      jest.spyOn(categoryRepositoryMock, 'save').mockResolvedValue(expected);

      let sut: any;

      beforeEach(async () => {
        sut = await service.create(createCategoryDto);
      });

      test('then it should create a category', () => {
        expect(categoryRepositoryMock.create).toHaveBeenCalledWith({
          ...createCategoryDto,
        });
      });

      test('then it should save the category', () => {
        expect(categoryRepositoryMock.save).toHaveBeenCalledWith(expected);
      });

      test('then it should return the created category', async () => {
        expect(sut).toEqual(expected);
      });
    });
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      const expected = [categoryMock(), categoryMock()];
      jest.spyOn(categoryRepositoryMock, 'find').mockReturnValue(expected);
      let sut: any;

      beforeEach(async () => {
        sut = await service.findAll();
      });

      test('then it should search for categories', () => {
        expect(categoryRepositoryMock.find).toHaveBeenCalled();
      });

      test('then it should return the categories array', async () => {
        expect(sut).toEqual(expected);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      const expected = categoryMock();
      let sut: any;

      beforeEach(async () => {
        sut = await service.findOne(expected.id);
      });

      test('then it should search for the category', () => {
        expect(categoryRepositoryMock.findOneBy).toHaveBeenCalledWith({
          id: expected.id,
        });
      });

      test('then it should return the categories', () => {
        expect(sut).toEqual(expected);
      });

      describe('when no category is found', () => {
        const fakeId = 'Non-existing-id';
        test('then it should throw a NotFoundException', async () => {
          await expect(service.findOne(fakeId)).rejects.toThrow(
            new HttpException(
              `Category with ID ${fakeId} not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      let sut: any;
      const categoryToUpdate: UpdateCategoryDto = {
        name: 'New Name',
      };
      const realId = 'REAL-UUID';
      const fakeId = 'mocking-not-existing-id';
      beforeEach(async () => {
        sut = await service.update(realId, categoryToUpdate);
      });

      test('then it should call update in the repository', () => {
        expect(categoryRepositoryMock.update).toHaveBeenCalledWith(
          realId,
          categoryToUpdate,
        );
      });
      test('then it should return an affected: 1', () => {
        expect(sut.affected).toBe(1);
      });

      describe('and no post is found', () => {
        test('then it should throw a NotFoundException', async () => {
          await expect(
            service.update(fakeId, categoryToUpdate),
          ).rejects.toThrow(
            new HttpException(
              `Category with ID ${fakeId} not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let sut: any;
      const category = categoryMock();

      beforeEach(async () => {
        sut = await service.remove(category.id);
      });

      test('then it should call delete with the id', () => {
        expect(categoryRepositoryMock.delete).toHaveBeenCalledWith(category.id);
      });

      test('then it should return a resolved promise with 1 affected', () => {
        expect(sut.affected).toBe(1);
      });

      describe('and no category is found', () => {
        const fakeId = 'mocking-not-existing-id';
        test('then it should throw a NotFoundException', async () => {
          await expect(service.remove(fakeId)).rejects.toThrow(
            new HttpException(
              `Category with ID ${fakeId} not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });
});
