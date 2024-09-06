import { categoryMock } from './categoryEntity.mock';

const affectedResponse = async (criteria: string) => {
  if (criteria === 'REAL-UUID') {
    return {
      affected: 1,
      raw: [],
    };
  } else {
    return {
      affected: 0,
      raw: [],
    };
  }
};

export const categoryRepositoryMock = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn().mockImplementation(async (criteria) => {
    return criteria.id === categoryMock().id ? categoryMock() : null;
  }),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn().mockImplementation(affectedResponse),
  update: jest.fn().mockImplementation(affectedResponse),
};
