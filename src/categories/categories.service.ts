import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PostgresErrorCode } from '../database/pgErrorCodes.enum';
import { PostsService } from '../posts/posts.service';
import { Post } from '../posts/entities/post.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,

    private readonly postsService: PostsService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = this.categoriesRepository.create(createCategoryDto);
      return await this.categoriesRepository.save(newCategory);
    } catch (error: any) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'Category with than name already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    return await this.categoriesRepository.find();
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOneBy({ id: id });
    if (!category) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const response = await this.categoriesRepository.update(
      id,
      updateCategoryDto,
    );
    if (response.affected === 0) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return response;
  }

  async remove(id: string) {
    const response = await this.categoriesRepository.delete(id);
    if (response.affected === 0) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return response;
  }

  private isCategoryLinked(post: Post, category: Category): boolean {
    return post.categories.some((cat: Category) => cat.id === category.id);
  }

  private async linkCategory(post: Post, category: Category) {
    post.categories.push(category);
    return await this.postsService.save(post);
  }
  private async unlinkCategory(post: Post, category: Category) {
    post.categories = post.categories.filter((c) => c.id !== category.id);
    return await this.postsService.save(post);
  }

  async modifyCategoryLink(postId: string, categoryId: string): Promise<Post> {
    const [category, post] = await Promise.all([
      this.findOne(categoryId),
      this.postsService.findOne(postId),
    ]);
    if (!this.isCategoryLinked(post, category)) {
      return await this.linkCategory(post, category);
    } else {
      return await this.unlinkCategory(post, category);
    }
  }
}
