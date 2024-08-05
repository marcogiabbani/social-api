import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import { PostgresErrorCode } from '../database/pgErrorCodes.enum';

@Injectable()
export class AuthenticationService {
  constructor(private readonly usersService: UsersService) {}

  async register(registerUserDto: RegisterUserDto) {
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);
    try {
      const createdUser = await this.usersService.create({
        ...registerUserDto,
        password: hashedPassword,
      });
      createdUser.password = '';
      return createdUser;
    } catch (error: any) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAuthenticatedUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    const passwordMatches = await bcrypt.compare(user.password, password);
    if (passwordMatches) {
      user.password = '';
      return user;
    }
    return 'wrong credentials';
  }
}
