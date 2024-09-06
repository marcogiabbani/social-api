import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';

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
    const post = await this.postRepository.findOneBy({ id: id });
    if (!post) {
      throw new HttpException(
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return post;
  }

  async findByUserId(userId: string) {
    return await this.postRepository.find({
      where: { author: { id: userId } },
    });
  }

  async remove(id: string) {
    const response = await this.postRepository.delete(id);
    if (response.affected === 0) {
      throw new HttpException(
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return response;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    const response = await this.postRepository.update(id, updatePostDto);
    if (response.affected === 0) {
      throw new HttpException(
        `Post with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return response;
  }
}
