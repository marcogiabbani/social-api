import { IsNotEmpty } from 'class-validator';

export class CreateCategoryDto {
  constructor(name: string) {
    this.name = name;
  }

  @IsNotEmpty()
  name;
}
