import { userMock } from './user.mock';
import { CreateUserDto } from '../dto/create-user.dto';

export const userRepositoryMock = {
  find: jest.fn().mockResolvedValue([userMock()]),
  findOne: jest.fn().mockResolvedValue(userMock()),
  create: jest.fn().mockReturnValue(userMock()),
  save: jest.fn().mockResolvedValue(userMock()),
  delete: jest.fn(),
};
