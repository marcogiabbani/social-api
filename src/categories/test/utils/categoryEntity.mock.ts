import { Category } from '../../entities/category.entity';
export const categoryMock = (): Category => {
  return {
    id: 'REAL-UUID',
    createdAt: new Date('2022-01-01T00:00:00Z'),
    updatedAt: new Date('2022-01-01T00:00:00Z'),
    name: 'Category name test',
    posts: [],
  };
};
