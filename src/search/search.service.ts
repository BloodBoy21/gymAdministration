import { Injectable, Logger } from '@nestjs/common';
import { SearchQueryDto } from '../dtos/searchQuery.dto';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../schemas/user.schema';
import { UserWsTransferDto } from '../users/dto/userWSTransfer.dto';
class SearchQuery extends SearchQueryDto {
  constructor(data: SearchQueryDto) {
    super();
    Object.assign(this, data);
  }
  private iLikeFilter(field: string) {
    return this[field]
      ? {
          [field]: {
            [Op.iLike]: `%${this[field]}%`,
          },
        }
      : {};
  }
  private booleanFilter(field: string) {
    return this[field] ? { [field]: this[field] } : {};
  }
  private isYearOrFullDate(date: string) {
    const fullDate = new Date(date);
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    const oneYear = 1000 * 60 * 60 * 24 * 30 * 12;
    return date.includes('-')
      ? new Date(fullDate.getTime() + oneMonth)
      : new Date(fullDate.getTime() + oneYear);
  }
  //TODO: fix date parsing and add middleware to parse data
  generateQuery() {
    const query = {};
    if (this.from) {
      query['membershipExpiration'] = {
        [Op.gte]: new Date(this.from),
        [Op.lt]: this.isYearOrFullDate(
          this.to ? this.to.toString() : this.from.toString(),
        ),
      };
    }
    return Object.assign(
      query,
      this.iLikeFilter('firstName'),
      this.iLikeFilter('lastName'),
      this.iLikeFilter('membership'),
      this.booleanFilter('isActive'),
    );
  }
}
@Injectable()
export class SearchService {
  private logger: Logger = new Logger(SearchService.name);
  private readonly userModel: typeof User;
  constructor(@InjectModel(User) userModel: typeof User) {
    this.userModel = userModel;
  }
  async search(query: SearchQueryDto): Promise<UserWsTransferDto[]> {
    const searchQuery = new SearchQuery(query);
    this.logger.debug(`Searching for ${JSON.stringify(searchQuery)}`);
    return await this.userModel.findAll({
      where: searchQuery.generateQuery(),
    });
  }
}
