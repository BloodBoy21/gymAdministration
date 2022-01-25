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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from '../schemas/user.schema';
import { UpgradeMembershipDto } from './dto/upgradeMembership.dto';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('/add')
  @HttpCode(201)
  async addUser(@Body() user: UserDto): Promise<UserWsTransferDto> {
    try {
      const userRegistered: UserWsTransferDto = await this.usersService.addUser(
        user,
      );
      return new UserWsTransferDto().send(userRegistered);
    } catch (err) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  @Get('/all')
  @HttpCode(200)
  async getUsers(): Promise<User[]> {
    return await this.usersService.getUsers();
  }
  @Get('/user/:id')
  @HttpCode(200)
  async getUser(@Param('id') id: string): Promise<User> {
    return await this.usersService.getUser(id);
  }
  @Patch('/update/:id')
  @HttpCode(204)
  async updateUser(
    @Param('id') id: string,
    @Body() user: UserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, user);
  }
  @Delete('/delete/:id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string) {
    return await this.usersService.deleteUser(id);
  }
  @Patch('/upgrade/:id')
  @HttpCode(204)
  async upgradeMembership(
    @Param('id') id: string,
    @Body() data: UpgradeMembershipDto,
  ) {
    await this.usersService.upgradeMembership(id, data);
  }
  @Get('/access/:id')
  @HttpCode(200)
  async getAccess(@Param('id') id: string) {
    const allowed = await this.usersService.getAccess(id);
    return { allowed };
  }
}
