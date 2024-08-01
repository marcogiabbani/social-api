import { userMock } from './userEntity.mock';

export const userRepositoryMock = {
  find: jest.fn().mockResolvedValue([userMock()]),
  findOne: jest.fn().mockResolvedValue(userMock()),
  create: jest.fn().mockReturnValue(userMock()),
  save: jest.fn().mockResolvedValue(userMock()),
  delete: jest.fn().mockResolvedValue('ok'),
  update: jest.fn().mockResolvedValue(userMock()),
};
