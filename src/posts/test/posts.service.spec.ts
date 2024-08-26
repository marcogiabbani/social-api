import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { userMock } from '../../users/utils/userEntity.mock';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from 'src/users/entities/user.entity';
import { UpdatePostDto } from '../dto/update-post.dto';
import { postMock } from './utils/postEntity.mock';
import { HttpException, HttpStatus } from '@nestjs/common';
import { mockPostRepository } from './utils/postService.mock';

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockPostRepository,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    describe('when create is called', () => {
      const expected = postMock();
      const createPostDto: CreatePostDto = {
        title: expected.title,
        content: expected.content,
      };
      const user: User = userMock();

      const createdPost = { ...createPostDto, author: user } as Post;
      jest.spyOn(mockPostRepository, 'create').mockReturnValue(createdPost);
      jest.spyOn(mockPostRepository, 'save').mockResolvedValue(createdPost);

      let sut: any;

      beforeEach(async () => {
        sut = await service.create(createPostDto, user);
      });

      test('then it should create a post', () => {
        expect(mockPostRepository.create).toHaveBeenCalledWith({
          ...createPostDto,
          author: user,
        });
      });

      test('then it should save the post', () => {
        expect(mockPostRepository.save).toHaveBeenCalledWith(createdPost);
      });

      test('then it should return the created post', async () => {
        expect(sut).toEqual(createdPost);
      });
    });
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };
      const user: User = userMock();
      const createdPost = { ...createPostDto, author: user } as Post;
      jest.spyOn(mockPostRepository, 'find').mockReturnValue([createdPost]);

      let sut: any;

      beforeEach(async () => {
        sut = await service.findAll();
      });

      test('then it should search for posts', () => {
        expect(mockPostRepository.find).toHaveBeenCalled();
      });

      test('then it should return the posts array', async () => {
        expect(sut).toEqual([createdPost]);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      const post = postMock();
      let sut: any;

      beforeEach(async () => {
        sut = await service.findOne(post.id);
      });

      test('then it should search for the post', () => {
        expect(mockPostRepository.findOneBy).toHaveBeenCalledWith({
          id: post.id,
        });
      });

      test('then it should return the posts', () => {
        expect(sut).toEqual(post);
      });

      describe('when no post is found', () => {
        const fakeId = 'Non-existing-id';
        test('then it should throw a NotFoundException', async () => {
          await expect(service.findOne(fakeId)).rejects.toThrow(
            new HttpException(
              `Post with ID ${fakeId} not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });

  describe('findByUserId', () => {
    describe('when findByUserId is called', () => {
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };
      const user: User = userMock();
      const createdPost = {
        ...createPostDto,
        author: user,
      } as Post;
      let sut: any;

      beforeEach(async () => {
        sut = await service.findByUserId(user.id);
      });

      test('then it should search for the post', () => {
        expect(mockPostRepository.find).toHaveBeenCalledWith({
          where: { author: { id: user.id } },
        });
      });

      test('then it should return the posts', async () => {
        expect(sut).toEqual([createdPost]);
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let sut: any;
      const post = postMock();

      beforeEach(async () => {
        sut = await service.remove(post.id);
      });

      test('then it should call delete with the id', () => {
        expect(mockPostRepository.delete).toHaveBeenCalledWith(post.id);
      });

      test('then it should return a resolved promise with 1 affected', () => {
        expect(sut.affected).toBe(1);
      });

      describe('when no post is found', () => {
        const fakeId = 'mocking-not-existing-id';
        test('then it should throw a NotFoundException', async () => {
          await expect(service.remove(fakeId)).rejects.toThrow(
            new HttpException(
              `Post with ID ${fakeId} not found`,
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });

  describe('update', () => {
    let sut: any;
    const postToUpdate: UpdatePostDto = {
      content: 'New Content',
    };
    const realId = 'REAL-UUID';
    const fakeId = 'mocking-not-existing-id';

    describe('when update is called', () => {
      beforeEach(async () => {
        sut = await service.update(realId, postToUpdate);
      });

      test('then it should call update in the repository', () => {
        expect(mockPostRepository.update).toHaveBeenCalledWith(
          realId,
          postToUpdate,
        );
      });
      test('then it should return an affected: 1', () => {
        expect(sut.affected).toBe(1);
      });
    });

    describe('when no post is found', () => {
      test('then it should throw a NotFoundException', async () => {
        await expect(service.update(fakeId, postToUpdate)).rejects.toThrow(
          new HttpException(
            `Post with ID ${fakeId} not found`,
            HttpStatus.NOT_FOUND,
          ),
        );
      });
    });
  });
});
