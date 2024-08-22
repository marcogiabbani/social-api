import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto, user: User) {
    const newPost = this.postRepository.create({
      ...createPostDto,
      author: user,
    });
    return await this.postRepository.save(newPost);
  }

  async findAll() {
    return await this.postRepository.find({ relations: ['author'] });
  }

  async findOne(id: string) {
    return await this.postRepository.findOneBy({ id: id });
  }

  async findByUserId(userId: string) {
    return await this.postRepository.find({
      where: { author: { id: userId } },
    });
  }

  //findByCategory
  //deletebyId with auth
  //update with auth
}
