import { postMock } from './postEntity.mock';

interface ICriteria {
  id: string;
}

const affectedResponse = async (criteria: string | ICriteria) => {
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

export const mockPostRepository = {
  find: jest.fn(),
  findOneBy: jest.fn().mockImplementation(async (criteria: ICriteria) => {
    return criteria.id === postMock().id ? postMock() : null;
  }),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn().mockImplementation(affectedResponse),
  update: jest.fn().mockImplementation(affectedResponse),
};
