import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { SearchQueryDto } from './dtos/searchQuery.dto';
import { parseUser } from './rt-updates.gateway';
import { SearchService } from './search/search.service';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  @Render('index')
  root() {}
  @Get('/search')
  async searchForm(@Query() query: SearchQueryDto) {
    const users: UserWsTransferDto[] = await this.searchService.search(query);
    return parseUser(users);
  }
}
