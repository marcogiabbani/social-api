import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

const mockUserRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let repository: typeof mockUserRepository;
  let mockUser: User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));
  });

  mockUser = new User('email@email.com', 'password123');
  mockUser.id = '1';
  mockUser.createdAt = new Date();
  mockUser.updatedAt = new Date();

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user: User = mockUser;
      repository.create.mockReturnValue(user);
      repository.save.mockResolvedValue(user);

      const newUser = await service.create({
        email: 'email@email.com',
        password: 'password123',
      });

      expect(newUser).toBe(user);
    });
  });
});
