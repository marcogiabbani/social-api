import { Post } from '../../entities/post.entity';
import { userMock } from '../../../users/utils/userEntity.mock';

export const postMock = (): Post => {
  return {
    id: 'REAL-UUID',
    createdAt: new Date('2022-01-01T00:00:00Z'),
    updatedAt: new Date('2022-01-01T00:00:00Z'),
    title: 'Some Title test',
    content: 'Content test',
    author: userMock(),
    categories: [],
  };
};
