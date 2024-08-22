import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from '../posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from '../entities/post.entity';
import { userMock } from '../../users/utils/userEntity.mock';
import { CreatePostDto } from '../dto/create-post.dto';
import { User } from 'src/users/entities/user.entity';

const mockPostRepository = {
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;
  let repository: typeof mockPostRepository;
  let mockPost: Post;

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
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
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
      const createPostDto: CreatePostDto = {
        title: 'Test Title',
        content: 'Test Content',
      };
      const user: User = userMock();
      const createdPost = {
        ...createPostDto,
        author: user,
        id: 'Test-UUID-1235',
      } as Post;
      jest.spyOn(mockPostRepository, 'findOneBy').mockReturnValue(createdPost);

      let sut: any;

      beforeEach(async () => {
        sut = await service.findOne(createdPost.id);
      });

      test('then it should search for the post', () => {
        expect(mockPostRepository.findOneBy).toHaveBeenCalledWith({
          id: createdPost.id,
        });
      });

      test('then it should return the posts', async () => {
        expect(sut).toEqual(createdPost);
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
      const mockId = 'Test-UUID-4322';
      jest.spyOn(mockPostRepository, 'delete').mockReturnValue('ok');

      beforeEach(async () => {
        sut = await service.remove(mockId);
      });

      test('then it should call delete with the id', () => {
        expect(mockPostRepository.delete).toHaveBeenCalledWith(mockId);
      });

      test('then it should return a resolved promise with the value "ok"', () => {
        expect(sut).toBe('ok');
      });
    });
  });
});
