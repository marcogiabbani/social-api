import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
