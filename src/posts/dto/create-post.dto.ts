import { IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  constructor(title: string, content: string) {
    this.title = title;
    this.content = content;
  }
  @IsNotEmpty()
  title;

  @IsNotEmpty()
  content;
}
