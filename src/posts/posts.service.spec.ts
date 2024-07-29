import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';

const mockPostRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
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
    repository = module.get(getRepositoryToken(Post));
    mockPost = new Post('Test Title', 'Test Content');
    mockPost.id = '1';
    mockPost.createdAt = new Date();
    mockPost.updatedAt = new Date();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of posts', async () => {
      const result: Post[] = [mockPost];
      repository.find.mockResolvedValue(result); // Mock the repository method

      expect(await service.findAll()).toBe(result); // Call the service method and assert the result
    });
  });
});
