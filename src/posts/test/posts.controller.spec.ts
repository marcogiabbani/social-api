import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from '../posts.controller';
import { PostsService } from '../posts.service';
import { postMock } from './utils/postEntity.mock';
import { CreatePostDto } from '../dto/create-post.dto';
import RequestWithUser from '../../authentication/interfaces/requestWithUser.interface';
import { UpdatePostDto } from '../dto/update-post.dto';

const mockPostService = {
  findAll: jest.fn().mockResolvedValue([postMock()]),
  findOne: jest.fn().mockResolvedValue(postMock()),
  create: jest.fn().mockResolvedValue(postMock()),
  save: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(postMock()),
  update: jest.fn().mockResolvedValue({
    affected: 1,
    raw: [],
  }),
  remove: jest.fn().mockResolvedValue({
    affected: 1,
    raw: [],
  }),
};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostsService],
    })
      .overrideProvider(PostsService)
      .useValue(mockPostService)
      .compile();

    controller = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    describe('when create is called then', () => {
      let sut: any;
      const dataMock = postMock();
      const createPostDto: CreatePostDto = {
        title: dataMock.title,
        content: dataMock.content,
      };

      const user = dataMock.author;
      const request = { user } as RequestWithUser;

      beforeEach(async () => {
        sut = await controller.create(createPostDto, request);
      });

      test('it should return the post', () => {
        expect(sut).toEqual(dataMock);
        expect(mockPostService.create).toHaveBeenCalledWith(
          createPostDto,
          user,
        );
      });
    });
  });

  describe('findAll', () => {
    const mockData = postMock();

    describe('when findAll is called then', () => {
      let sut: any;

      beforeEach(async () => {
        sut = await controller.findAll();
      });

      test('it should an array of posts', () => {
        expect(sut).toEqual([mockData]);
        expect(mockPostService.findAll).toHaveBeenCalled();
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called then', () => {
      let sut: any;
      const dataMock = postMock();

      beforeEach(async () => {
        sut = await controller.findOne(dataMock.id);
      });

      test('it should return the post', () => {
        expect(sut).toEqual(dataMock);
        expect(mockPostService.findOne).toHaveBeenCalledWith(dataMock.id);
      });
    });
  });

  describe('findByUserId', () => {
    describe('when findByUserId is called then', () => {
      let sut: any;
      const dataMock = postMock();

      beforeEach(async () => {
        sut = await controller.findByUserId(dataMock.author.id);
      });

      test('it should return the post', () => {
        expect(sut).toEqual(dataMock);
        expect(mockPostService.findByUserId).toHaveBeenCalledWith(
          dataMock.author.id,
        );
      });
    });
  });

  describe('update', () => {
    describe('when update is called then', () => {
      let sut: any;
      const dataMock = postMock();

      const postToUpdate: UpdatePostDto = {
        content: 'New Content',
      };

      beforeEach(async () => {
        sut = await controller.update(dataMock.author.id, postToUpdate);
      });

      test('it should return the post', () => {
        expect(sut.affected).toBe(1);
        expect(mockPostService.update).toHaveBeenCalledWith(
          dataMock.author.id,
          postToUpdate,
        );
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called then', () => {
      let sut: any;
      const dataMock = postMock();

      beforeEach(async () => {
        sut = await controller.remove(dataMock.author.id);
      });

      test('it should return the post', () => {
        expect(sut.affected).toBe(1);
        expect(mockPostService.remove).toHaveBeenCalledWith(dataMock.author.id);
      });
    });
  });
});
