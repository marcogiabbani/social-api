import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { userMock } from './utils/user.mock';
import { usersServiceMock } from './utils/usersService.mock';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;

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

      test('then it should call usersService.findAll', () => {
        expect(usersServiceMock.findAll).toHaveBeenCalled();
      });

      test('then it should return users', () => {
        expect(users).toEqual([userMock()]);
      });
    });
  });

  //   xdescribe('findOnde', () => {
  //     describe('when findOne is called', () => {
  //       let user: User | null;

  //       beforeEach(async () => {
  //         user = await controller.findOne(userMock().id);
  //       });

  //       test('then it should return a user', async () => {
  //         expect(user).toEqual(userMock());
  //       });

  //       test('then it should call the repository with the correct argument', () => {
  //         expect(usersServiceMock.findOne).toHaveBeenCalledWith({
  //           where: { id: userMock().id },
  //         });
  //       });
  //     });
  //   });

  //   xdescribe('create', () => {
  //     describe('when create is called', () => {
  //       let user: User;

  //       const createUserDto = new CreateUserDto(
  //         userMock().email,
  //         userMock().password,
  //       );

  //       beforeEach(async () => {
  //         user = await controller.create(createUserDto);
  //       });

  //       test('then it should return the created user', () => {
  //         expect(user).toEqual(userMock());
  //       });

  //       test('then an entity instance should have been created', () => {
  //         expect(usersServiceMock.create).toHaveBeenCalledWith(createUserDto);
  //       });

  //       test('then it should save the created user', async () => {
  //         expect(usersServiceMock.save).toHaveBeenCalledWith(userMock());
  //       });
  //     });
  //   });

  //   xdescribe('remove', () => {
  //     describe('when remove is called', () => {
  //       let response: any;
  //       //   const removeSpy = jest
  //       //     .spyOn(usersServiceMock, 'delete')
  //       //     .mockResolvedValue('ok');

  //       beforeEach(async () => {
  //         response = await controller.remove(userMock().id);
  //       });

  //       test('then it should call delete with the id', () => {
  //         expect(usersServiceMock.delete).toHaveBeenCalledWith(userMock().id);
  //       });

  //       test('then it should return a resolved promise with the value "ok"', () => {
  //         expect(response).toBe('ok');
  //       });
  //     });
  //   });

  //   xdescribe('update', () => {
  //     describe('when update is called', () => {
  //       const updateUserDto = { password: userMock().password };
  //       let user: User | null;

  //       beforeEach(async () => {
  //         user = await controller.update(userMock().id, updateUserDto);
  //       });

  //       test('then it should return the user', () => {
  //         expect(user).toBeDefined();
  //         expect(usersServiceMock.findOne).toHaveBeenCalledWith({
  //           where: { id: userMock().id },
  //         });
  //       });

  //       test('then it should call the repository update', () => {
  //         expect(usersServiceMock.update).toHaveBeenCalledWith(
  //           userMock().id,
  //           updateUserDto,
  //         );
  //       });
  //     });
  //   });
});
