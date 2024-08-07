import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../../src/users/users.service';
import { usersServiceMock } from '../../src/users/utils/usersService.mock';
import { userMock } from '../../src/users/utils/userEntity.mock';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/pgErrorCodes.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthenticationService, UsersService],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    describe('when register is called', () => {
      test('then bcrypt should hash the password', async () => {
        //arrange
        const registerUserDto = {
          email: userMock().email,
          password: userMock().password,
        };
        const SALT_ROUNDS: number = 10;
        const hashedPassword = await bcrypt.hash(
          userMock().password,
          SALT_ROUNDS,
        );
        jest
          .spyOn(bcrypt, 'hash')
          .mockImplementationOnce(async () => hashedPassword);

        //act
        await service.register(registerUserDto);

        //assert
        expect(bcrypt.hash).toHaveBeenCalledWith(
          registerUserDto.password,
          SALT_ROUNDS,
        );
      });

      test('then the user service should receive a user with hashed password', async () => {
        //arrange
        const registerUserDto = {
          email: userMock().email,
          password: userMock().password,
        };
        const SALT_ROUNDS: number = 10;
        const hashedPassword = await bcrypt.hash(
          userMock().password,
          SALT_ROUNDS,
        );

        jest
          .spyOn(bcrypt, 'hash')
          .mockImplementationOnce(async () => hashedPassword);

        //act
        await service.register(registerUserDto);

        //assert
        expect(usersServiceMock.create).toHaveBeenCalledWith({
          email: userMock().email,
          password: hashedPassword,
        });
      });

      test('then the returned user should have an empty string as password', async () => {
        //arrange
        const registerUserDto = {
          email: userMock().email,
          password: userMock().password,
        };

        //act
        const createdUser = await service.register(registerUserDto);

        //assert
        expect(createdUser.password).toBe('');
      });
    });

    describe('when user already exists', () => {
      test('then it should throw a new HTTP exception with BAD Request status', async () => {
        //arrange
        const registerUserDto = {
          email: userMock().email,
          password: userMock().password,
        };
        jest
          .spyOn(usersServiceMock, 'create')
          .mockRejectedValueOnce({ code: PostgresErrorCode.UniqueViolation });

        try {
          //act
          await service.register(registerUserDto);
        } catch (error) {
          //assert
          expect(error).toBeInstanceOf(HttpException);
          expect(error).toHaveProperty('status', HttpStatus.BAD_REQUEST);
          expect(error).toHaveProperty(
            'message',
            'User with that email already exists',
          );
        }
      });
    });

    describe('when an unspecified error occurs', () => {
      test('then a server error should be thrown', async () => {
        //arrange
        const registerUserDto = {
          email: userMock().email,
          password: userMock().password,
        };
        jest
          .spyOn(usersServiceMock, 'create')
          .mockRejectedValueOnce(new Error('Unspecified error'));

        try {
          //act
          await service.register(registerUserDto);
        } catch (error) {
          //assert
          expect(error).toBeInstanceOf(HttpException);
          expect(error).toHaveProperty(
            'status',
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
          expect(error).toHaveProperty('message', 'Something went wrong');
        }
      });
    });
  });

  describe('getAuthenticatedUser', () => {
    describe('when getAuthenticatedUser called', () => {
      test('then it should first call users service findByEmail', async () => {
        //arrange
        const userCredentials = {
          email: userMock().email,
          password: userMock().password,
        };
        jest
          .spyOn(usersServiceMock, 'findByEmail')
          .mockReturnValueOnce(userMock());
        jest
          .spyOn(bcrypt, 'compare')
          .mockImplementationOnce(() => Promise.resolve(true));

        //act
        await service.getAuthenticatedUser(
          userCredentials.email,
          userCredentials.password,
        );
        //assert
        expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(
          userCredentials.email,
        );
      });

      test('if no user is found, then it should throw an exception', async () => {
        //arrange
        const userCredentials = {
          email: userMock().email,
          password: userMock().password,
        };
        jest
          .spyOn(usersServiceMock, 'findByEmail')
          .mockImplementationOnce(() => {
            throw new HttpException(
              'User with this email does not exist',
              HttpStatus.NOT_FOUND,
            );
          });
        try {
          //act
          await service.getAuthenticatedUser(
            'fake@email.com',
            userCredentials.password,
          );
        } catch (error) {
          //assert
          expect(error).toBeInstanceOf(HttpException);
          expect(error).toHaveProperty('status', HttpStatus.BAD_REQUEST);
          expect(error).toHaveProperty('message', 'Wrong credentials provided');
        }
      });

      test('then it should validate the password', async () => {
        //arrange
        const userCredentials = {
          email: userMock().email,
          password: userMock().password,
        };
        const SALT_ROUNDS: number = 10;
        const hashedPassword = await bcrypt.hash(
          userMock().password,
          SALT_ROUNDS,
        );
        jest
          .spyOn(usersServiceMock, 'findByEmail')
          .mockResolvedValueOnce({ ...userMock(), password: hashedPassword });
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

        //act
        await service.getAuthenticatedUser(
          userCredentials.email,
          userCredentials.password,
        );

        //assert
        expect(bcrypt.compare).toHaveBeenCalledWith(
          hashedPassword,
          userCredentials.password,
        );
      });

      test('then it should return the user with no password', async () => {
        //arrange
        const userCredentials = {
          email: userMock().email,
          password: userMock().password,
        };
        const expected = { ...userMock(), password: '' };
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => true);

        //act
        const sut = await service.getAuthenticatedUser(
          userCredentials.email,
          userCredentials.password,
        );

        //assert
        expect(sut).toEqual(expected);
      });

      test('if passwords do not match it should throw an exception', async () => {
        //arrange
        const userCredentials = {
          email: userMock().email,
          password: userMock().password,
        };
        jest.spyOn(bcrypt, 'compare').mockImplementationOnce(async () => false);

        try {
          //act
          await service.getAuthenticatedUser(
            userCredentials.email,
            'wrongPassword',
          );
        } catch (error) {
          expect(error).toBeInstanceOf(HttpException);
          expect(error).toHaveProperty('status', HttpStatus.BAD_REQUEST);
          expect(error).toHaveProperty('message', 'Wrong credentials provided');
        }
      });
    });
  });
});
