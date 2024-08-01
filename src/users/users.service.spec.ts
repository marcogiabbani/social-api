import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { userMock } from './utils/userEntity.mock';
import { userRepositoryMock } from './utils/userRepository.mock';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      let users: User[];

      beforeEach(async () => {
        users = await service.findAll();
      });

      test('then it should call userRepository', () => {
        expect(userRepositoryMock.find).toHaveBeenCalled();
      });

      test('then it should return users', () => {
        expect(users).toEqual([userMock()]);
      });
    });
  });

  describe('findOnde', () => {
    describe('when findOne is called', () => {
      let user: User | null;

      beforeEach(async () => {
        user = await service.findOne(userMock().id);
      });

      test('then it should return a user', async () => {
        expect(user).toEqual(userMock());
      });

      test('then it should call the repository with the correct argument', () => {
        expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
          where: { id: userMock().id },
        });
      });
    });
  });

  describe('create', () => {
    describe('when create is called', () => {
      let user: User;

      const createUserDto = new CreateUserDto(
        userMock().email,
        userMock().password,
      );

      beforeEach(async () => {
        user = await service.create(createUserDto);
      });

      test('then it should return the created user', () => {
        expect(user).toEqual(userMock());
      });

      test('then an entity instance should have been created', () => {
        expect(userRepositoryMock.create).toHaveBeenCalledWith(createUserDto);
      });

      test('then it should save the created user', async () => {
        expect(userRepositoryMock.save).toHaveBeenCalledWith(userMock());
      });
    });
  });

  describe('remove', () => {
    describe('when remove is called', () => {
      let response: any;
      //   const removeSpy = jest
      //     .spyOn(userRepositoryMock, 'delete')
      //     .mockResolvedValue('ok');

      beforeEach(async () => {
        response = await service.remove(userMock().id);
      });

      test('then it should call delete with the id', () => {
        expect(userRepositoryMock.delete).toHaveBeenCalledWith(userMock().id);
      });

      test('then it should return a resolved promise with the value "ok"', () => {
        expect(response).toBe('ok');
      });
    });
  });

  describe('update', () => {
    describe('when update is called', () => {
      const updateUserDto = { password: userMock().password };
      let user: User | null;

      beforeEach(async () => {
        user = await service.update(userMock().id, updateUserDto);
      });

      test('then it should return the user', () => {
        expect(user).toBeDefined();
        expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
          where: { id: userMock().id },
        });
      });

      test('then it should call the repository update', () => {
        expect(userRepositoryMock.update).toHaveBeenCalledWith(
          userMock().id,
          updateUserDto,
        );
      });
    });
  });
});
