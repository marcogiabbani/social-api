import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../../src/users/users.service';
import { usersServiceMock } from '../../src/users/utils/usersService.mock';
import { userMock } from '../../src/users/utils/userEntity.mock';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/pgErrorCodes.enum';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let registerUserDto: RegisterUserDto;
  let hashedPassword: string;
  let hashedRegisterUserDto: RegisterUserDto;
  const SALT_ROUNDS: number = 10;

  beforeAll(async () => {
    hashedPassword = await bcrypt.hash(userMock().password, 10);
    hashedRegisterUserDto = {
      email: userMock().email,
      password: hashedPassword,
    };
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => hashedPassword);
    jest
      .spyOn(usersServiceMock, 'findByEmail')
      .mockResolvedValue({ ...userMock(), password: hashedPassword });
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    registerUserDto = {
      email: userMock().email,
      password: userMock().password,
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    describe('when register is called', () => {
      let createdUser: User;

      beforeEach(async () => {
        jest.spyOn(usersServiceMock, 'create').mockResolvedValue(userMock());
        createdUser = await service.register(registerUserDto);
      });

      test('then the password should be hashed', () => {
        expect(bcrypt.hash).toHaveBeenCalledWith(
          registerUserDto.password,
          SALT_ROUNDS,
        );
      });

      test('then the user service should receive a user with hashed password', async () => {
        expect(usersServiceMock.create).toHaveBeenCalledWith(
          hashedRegisterUserDto,
        );
      });

      test('then the returned user should have an empty string as password', async () => {
        expect(createdUser.password).toBe('');
      });
    });

    describe('when user already exists', () => {
      beforeEach(async () => {
        jest
          .spyOn(usersServiceMock, 'create')
          .mockRejectedValue({ code: PostgresErrorCode.UniqueViolation });
      });

      test('then it should throw a new HTTP exception with BAD Request status', async () => {
        await expect(service.register(registerUserDto)).rejects.toThrow(
          new HttpException(
            'User with that email already exists',
            HttpStatus.BAD_REQUEST,
          ),
        );
      });
    });

    describe('when an unspecified error occurs', () => {
      beforeEach(async () => {
        jest
          .spyOn(usersServiceMock, 'create')
          .mockRejectedValue(new Error('Unspecified error'));
      });

      test('then a server error should be thrown', async () => {
        await expect(service.register(registerUserDto)).rejects.toThrow(
          new HttpException(
            'Something went wrong',
            HttpStatus.INTERNAL_SERVER_ERROR,
          ),
        );
      });
    });
  });

  describe('getAuthenticatedUser', () => {
    const userCredentials = {
      email: userMock().email,
      password: userMock().password,
    };

    const authenticatedUser = { ...userMock(), password: '' };
    let user: any;

    describe('when called', () => {
      beforeEach(async () => {
        jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

        user = await service.getAuthenticatedUser(
          userCredentials.email,
          userCredentials.password,
        );
      });
      test('then it should search the user by email', () => {
        expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
          userCredentials.email,
        );
      });

      test('then should compare the received password with the stored hashed one', () => {
        expect(bcrypt.compare).toHaveBeenCalledWith(
          user.password,
          userCredentials.password,
        );
      });

      test('then it should return a user with empty password if credentials are valid', () => {
        expect(user).toEqual(authenticatedUser);
      });
    });

    describe('when wrong credentials are provided', () => {
      ///WIP
    });
  });
});
