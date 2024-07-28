import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Post from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  @InjectRepository(Post)
  private postRepository: Repository<Post>;

  async create(createPostDto: CreatePostDto) {
    const newPost = this.postRepository.create(createPostDto);
    return await this.postRepository.save(newPost);
  }

  async findAll() {
    return await this.postRepository.find();
  }

  async findOne(id: string) {
    return await this.postRepository.findOneBy({ id: id });
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
