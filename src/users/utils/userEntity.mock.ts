import { User } from '../entities/user.entity';

export const userMock = (): User => {
  return {
    id: '1',
    createdAt: new Date('2022-01-01T00:00:00Z'),
    updatedAt: new Date('2022-01-01T00:00:00Z'),
    email: 'test@email.com',
    password: 'somepassword123',
    posts: [],
  };
};
