import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationController } from '../authentication.controller';
import { AuthenticationService } from '../authentication.service';

describe('AuthenticationController', () => {
  let controller: AuthenticationController;

  const authenticationServiceMock = {
    register: jest.fn(),
    getAuthenticatedUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthenticationController],
      providers: [AuthenticationService],
    })
      .overrideProvider(AuthenticationService)
      .useValue(authenticationServiceMock)
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
});
