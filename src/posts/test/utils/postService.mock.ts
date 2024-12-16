import { postMock } from './postEntity.mock';
export const mockPostService = {
  findAll: jest.fn().mockResolvedValue([postMock()]),
  findOne: jest.fn().mockResolvedValue(postMock()),
  create: jest.fn().mockResolvedValue(postMock()),
  save: jest.fn(),
  findByUserId: jest.fn().mockResolvedValue(postMock()),
  update: jest.fn().mockResolvedValue({
    affected: 1,
    raw: [],
  }),
  remove: jest.fn().mockResolvedValue({
    affected: 1,
    raw: [],
  }),
  findOneWithCategories: jest.fn().mockResolvedValue(postMock()),
};
