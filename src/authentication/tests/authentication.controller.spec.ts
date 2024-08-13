import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { AuthenticationService } from '../authentication.service';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { userMock } from '../../users/utils/userEntity.mock';
import { LocalAuthenticationGuard } from '../localAuthentication.guard';
import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  const authenticationServiceMock = {
    register: jest.fn(),
    getAuthenticatedUser: jest.fn(),
    getCookieWithJwtToken: jest.fn(),
  };

  const requestMock = {
    user: {
      ...userMock(),
    },
  };

  const responseMock = {
    setHeader: jest.fn(),
    send: jest.fn(),
    status: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [AuthenticationService],
    })
      .overrideProvider(AuthenticationService)
      .useValue(authenticationServiceMock)
      .overrideGuard(LocalAuthenticationGuard)
      .useValue({
        canActivate: jest.fn((context: ExecutionContext) => {
          const request = context.switchToHttp().getRequest();
          request.user = requestMock.user;
          return true;
        }),
      })
      .compile();

    controller = module.get<AuthenticationController>(AuthenticationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  test('register', async () => {
    await controller.register({
      email: 'one@email.com',
      password: 'somePassword123',
    });

    expect(authenticationServiceMock.register).toHaveBeenCalled();
  });

  describe('login', () => {
    describe('when login is called', () => {
      test('then it should log in the user and set a cookie', async () => {
        //arrange
        const jwtMock = 'eyFakeJWT';
        authenticationServiceMock.getCookieWithJwtToken.mockReturnValue(
          `Authentication=eyFakeJWT; HttpOnly; Path=/`,
        );

        //act
        await controller.logIn(requestMock as RequestWithUser, responseMock);

        //assert
        expect(
          authenticationServiceMock.getCookieWithJwtToken,
        ).toHaveBeenCalledWith(requestMock.user.id);
        expect(responseMock.setHeader).toHaveBeenCalledWith(
          'Set-Cookie',
          `Authentication=${jwtMock}; HttpOnly; Path=/`,
        );
        expect(responseMock.send).toHaveBeenCalledWith({
          ...requestMock.user,
          password: '',
        });
      });
    });
  });
});
