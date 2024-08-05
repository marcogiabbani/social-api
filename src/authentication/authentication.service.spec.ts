import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationService } from './authentication.service';
import { UsersService } from '../../src/users/users.service';
import { usersServiceMock } from '../../src/users/utils/usersService.mock';
import { userMock } from '../../src/users/utils/userEntity.mock';
import { User } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

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
      let createdUser: User;
      let hashedPassword: string;

      beforeEach(async () => {
        hashedPassword = await bcrypt.hash(userMock().password, 10);
        jest
          .spyOn(usersServiceMock, 'create')
          .mockResolvedValue({ ...userMock(), password: hashedPassword });

        createdUser = await service.register({
          email: userMock().email,
          password: userMock().password,
        });
      });

      test('then the returned user should have an empty string as password', async () => {
        expect(createdUser.password).toBe('');
      });

      test('then the user service should receive a hashed password', async () => {
        expect(usersServiceMock.create).not.toHaveBeenCalledWith(
          userMock().password,
        );
      });
    });
  });
});
