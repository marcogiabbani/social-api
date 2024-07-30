import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { userMock } from './utils/user.mock';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    findOne: jest.fn().mockResolvedValue(userMock()),
    findAll: jest.fn().mockResolvedValue([userMock()]),
    create: jest.fn().mockResolvedValue(userMock()),
    update: jest.fn().mockResolvedValue(userMock()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    describe('when findAll is called', () => {
      let users: User[];

      beforeEach(async () => {
        users = await controller.findAll();
      });

      test('then it should call usersService', () => {
        expect(usersServiceMock.findAll).toHaveBeenCalled();
      });

      test('then it should return users', () => {
        expect(users).toEqual([userMock()]);
      });
    });
  });

  describe('findOne', () => {
    describe('when findOne is called', () => {
      let user: User;

      beforeEach(async () => {
        user = await controller.findOne(userMock().id);
      });

      //   test('then it should call usersService', () => {
      //     expect(usersServiceMock.findAll).toHaveBeenCalled();
      //   });

      //   test('then it should return users', () => {
      //     expect(users).toEqual([userMock()]);
      //   });
    });
  });
});
