import { Controller, Get, HttpCode, Query, Render } from '@nestjs/common';
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
  @HttpCode(200)
  @Render('index2')
  root() {
    return null;
  }
  @Get('/search')
  async searchForm(
    @Query() query: SearchQueryDto,
  ): Promise<UserWsTransferDto[]> {
    const users = await this.searchService.search(query);
    return parseUser(users) as UserWsTransferDto[];
  }
}
