import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from '../authentication.service';
import { UsersService } from '../../users/users.service';
import { usersServiceMock } from '../../users/utils/usersService.mock';
import { JwtService } from '@nestjs/jwt';
import { JwtServiceMock } from '../utils/jwt.service.mock';
import { ConfigService } from '@nestjs/config';
import { ConfigServiceMock } from '../utils/config.service.mock';
import { userMock } from '../../users/utils/userEntity.mock';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../../database/pgErrorCodes.enum';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * be aware,  that throw error should be in this format as i learned in the posts
 * service
 * 
    test('then it should throw a NotFoundException', async () => {
        await expect(service.update(fakeId, postToUpdate)).rejects.toThrow(
          new HttpException(
            `Post with ID ${fakeId} not found`,
            HttpStatus.NOT_FOUND,
          ),
        );
      });
 */

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        UsersService,
        JwtService,
        ConfigService,
      ],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .overrideProvider(JwtService)
      .useValue(JwtServiceMock)
      .overrideProvider(ConfigService)
      .useValue(ConfigServiceMock)
      .compile();
    service = module.get<AuthenticationService>(AuthenticationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(usersServiceMock).toBeDefined();
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

      //interceptor prevents sending the password field in aut controller now
      xtest('then the returned user should have an empty string as password', async () => {
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

      test('then it should call verifyPassword', async () => {
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
        jest.spyOn(service, 'verifyPassword').mockResolvedValue();

        //act
        await service.getAuthenticatedUser(
          userCredentials.email,
          userCredentials.password,
        );

        //assert
        expect(service.verifyPassword).toHaveBeenCalledWith(
          userCredentials.password,
          hashedPassword,
        );
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
          userCredentials.password,
          hashedPassword,
        );
      });

      //interceptor prevents sending the password field in aut controller now
      xtest('then it should return the user with no password', async () => {
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

  describe('getCookieWithJwtToken', () => {
    describe('when getCookieWithJwtToken is called', () => {
      test('then it should sign the id received', async () => {
        //arrange
        const payload = 'UUID-4EXAMPLE';
        const expected = 'eySomeExampleToken';
        jest.spyOn(JwtServiceMock, 'sign').mockReturnValueOnce(expected);

        //act
        const sut = JwtServiceMock.sign(payload);

        //assert
        expect(JwtServiceMock.sign).toHaveBeenCalledWith(payload);
        expect(sut).toBe(expected);
      });

      test('then it should return a cookie string with the tocken and configuration max age', async () => {
        //arrange
        const userId = 'UUID-4EXAMPLE';
        const token = 'eySomeExampleToken';
        const JWT_EXPIRATION_TIME = '3600';
        jest.spyOn(JwtServiceMock, 'sign').mockReturnValueOnce(token);
        jest.spyOn(ConfigServiceMock, 'get').mockReturnValueOnce('3600');
        const expected = `Authentication=${token}; HttpOnly; Path=/; Max-Age=${JWT_EXPIRATION_TIME}`;

        //act
        const sut = service.getCookieWithJwtToken(userId);

        //assert
        expect(sut).toBe(expected);
      });
    });
  });
});
