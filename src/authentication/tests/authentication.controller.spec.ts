import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { AuthenticationService } from '../authentication.service';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import { userMock } from '../../users/utils/userEntity.mock';
import { LocalAuthenticationGuard } from '../local-authentication.guard';
import { ExecutionContext } from '@nestjs/common';
import { Response } from 'express';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  const authenticationServiceMock = {
    register: jest.fn(),
    getAuthenticatedUser: jest.fn(),
    getCookieWithJwtToken: jest.fn(),
    getCookieForLogOut: jest.fn(),
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
      it('should log in the user and set a cookie', async () => {
        //arrange
        const jwtMock = 'eyFakeJWT';
        authenticationServiceMock.getCookieWithJwtToken.mockReturnValueOnce(
          `Authentication=eyFakeJWT; HttpOnly; Path=/`,
        );
        //extends requestMock to include the response
        const requestWithResponseMock = {
          ...requestMock,
          res: responseMock,
        } as RequestWithUser;

        //act
        const result = await controller.logIn(requestWithResponseMock);

        //expect
        expect(
          authenticationServiceMock.getCookieWithJwtToken,
        ).toHaveBeenCalledWith(requestMock.user.id);
        expect(responseMock.setHeader).toHaveBeenCalledWith(
          'Set-Cookie',
          `Authentication=${jwtMock}; HttpOnly; Path=/`,
        );
        expect(result).toEqual(requestMock.user);
      });
    });

    describe('log-out', () => {
      it('should reset the cookie', async () => {
        //arrange
        const logOutCookie = 'Authentication=; HttpOnly; Path=/; Max-Age=0';
        authenticationServiceMock.getCookieForLogOut.mockReturnValueOnce(
          logOutCookie,
        );
        const requestWithResponseMock = {
          ...requestMock,
          res: responseMock,
        } as RequestWithUser;

        //act
        const result = await controller.logOut(requestWithResponseMock);

        //expect
        expect(authenticationServiceMock.getCookieForLogOut).toHaveBeenCalled();
        expect(responseMock.setHeader).toHaveBeenCalledWith(
          'Set-Cookie',
          logOutCookie,
        );
        expect(result).toBeUndefined();
      });
    });
  });
});
