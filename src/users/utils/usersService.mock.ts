import { userMock } from './user.mock';

export const usersServiceMock = {
  findOne: jest.fn().mockResolvedValue(userMock()),
  findAll: jest.fn().mockResolvedValue([userMock()]),
  create: jest.fn().mockResolvedValue(userMock()),
  update: jest.fn().mockResolvedValue(userMock()),
  remove: jest.fn().mockResolvedValue('ok'),
};
