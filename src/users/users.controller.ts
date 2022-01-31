import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from '../schemas/user.schema';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';
import { parseUser } from '../rt-updates.gateway';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @HttpCode(200)
  async getUsers(): Promise<UserWsTransferDto[]> {
    const users = await this.usersService.getUsers();
    return parseUser(users) as UserWsTransferDto[];
  }
  @Post('/user')
  @HttpCode(201)
  async addUser(@Body() userData: UserDto): Promise<UserWsTransferDto> {
    const { user, error } = await this.usersService.addUser(userData);
    if (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return new UserWsTransferDto().send(user as UserWsTransferDto);
  }
  @Get('/user/:id')
  @HttpCode(200)
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.getUser(id);
  }
  @Patch('/user/:id')
  @HttpCode(204)
  async updateUser(
    @Param('id') id: string,
    @Body() user: UserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, user);
  }
  @Delete('/user/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const userWasDeleted: boolean = await this.usersService.deleteUser(id);
    if (!userWasDeleted) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'User not found or soon to be deleted',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return { status: 204, error: null };
  }
  @Get('/csv')
  @HttpCode(200)
  async getUsersCsv(@Res() res) {
    const csvPath = await this.usersService.exportUsersToCsv();
    res.download(csvPath, 'users.csv');
  }
}
