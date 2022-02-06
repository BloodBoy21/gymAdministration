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
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private badRequest(error: string) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        error,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
  @Get()
  @HttpCode(200)
  async getUsers(): Promise<UserWsTransferDto[]> {
    const users = await this.usersService.getUsers();
    return users;
  }
  @Post('/user')
  @HttpCode(201)
  async addUser(@Body() userData: UserDto): Promise<UserWsTransferDto> {
    const { user, error } = await this.usersService.addUser(userData);
    if (error) {
      this.badRequest(error);
    }
    return new UserWsTransferDto().send(user as UserWsTransferDto);
  }
  @Get('/user/:id')
  @HttpCode(200)
  async getUser(@Param('id') id: string): Promise<UserWsTransferDto> {
    const user: UserWsTransferDto = await this.usersService.getUser(id);
    if (!user) {
      this.badRequest('User not found');
    }
    return user;
  }
  @Patch('/user/:id')
  @HttpCode(204)
  async updateUser(
    @Param('id') id: string,
    @Body() user: UserDto,
  ): Promise<UserWsTransferDto> {
    return this.usersService.updateUser(id, user);
  }
  @Delete('/user/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    const userWasDeleted: boolean = await this.usersService.deleteUser(id);
    if (!userWasDeleted) {
      this.badRequest('User not found');
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
