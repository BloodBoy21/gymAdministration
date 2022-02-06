import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Render,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AppService } from './app.service';
import { SearchQueryDto } from './dtos/searchQuery.dto';
import { parseUser } from './rt-updates.gateway';
import { SearchService } from './search/search.service';
import { UserDto } from './users/dto/user.dto';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';
import { UsersService } from './users/users.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly searchService: SearchService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @HttpCode(200)
  @Render('index')
  root() {
    return null;
  }
  @Get('/list')
  @Render('users')
  showUsersHandler() {
    return void 0;
  }
  @Get('/update-user/:id')
  @HttpCode(200)
  async updateUser(@Param('id') id: string, @Res() res: Response) {
    const user = await this.usersService.getUser(id);
    res.render('updateUser', {
      locals: {
        user,
      },
    });
  }
  @Post('update-user/:id')
  async updateUserHandler(@Param('id') id: string, @Body() user: UserDto) {
    return await this.usersService.updateUser(id, user);
  }
  @Get('/search')
  async searchForm(
    @Query() query: SearchQueryDto,
  ): Promise<UserWsTransferDto[]> {
    const users = await this.searchService.search(query);
    return parseUser(users) as UserWsTransferDto[];
  }
}
