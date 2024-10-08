import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { userMock } from '../utils/userEntity.mock';
import { userRepositoryMock } from '../utils/userRepository.mock';
import { CreateUserDto } from '../dto/create-user.dto';
import { Logger, HttpException, HttpStatus } from '@nestjs/common';

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
        Logger,
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

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let user: User | null;

      test('then it should return a user', async () => {
        user = await service.findOne(userMock().id);
        expect(user).toEqual(userMock());
      });

      test('then it should call the repository with the correct argument', async () => {
        user = await service.findOne(userMock().id);
        expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
          where: { id: userMock().id },
        });
      });

      test('if no user is found it should throw a not found exception', async () => {
        try {
          jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValueOnce(null);
          const user = await service.findOne(userMock().id);
          console.log('user', user);
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error).toHaveProperty('message', 'User does not exist');
          expect(error).toHaveProperty('status', HttpStatus.NOT_FOUND);
        }
      });
    });
  });

  describe('findByEmail', () => {
    describe('when findByEmail is called', () => {
      let user: User | null;

      beforeEach(async () => {
        user = await service.findByEmail(userMock().email);
      });

      test('then it should return the user', () => {
        expect(user).toEqual(userMock());
      });

      test('then it should call the repository with an email', () => {
        expect(userRepositoryMock.findOne).toHaveBeenCalledWith({
          where: { email: userMock().email },
        });
      });

      test('if no userEmail exists the it should warn the user', async () => {
        jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValue(null);

        await expect(
          service.findByEmail('unexisting@email.com'),
        ).rejects.toEqual(
          new HttpException(
            'User with this email does not exist',
            HttpStatus.NOT_FOUND,
          ),
        );
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
