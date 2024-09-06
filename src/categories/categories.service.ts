import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(newCategory);
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
