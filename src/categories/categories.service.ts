import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { PostgresErrorCode } from '../database/pgErrorCodes.enum';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
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
}
