import { Injectable } from '@nestjs/common';
import { SearchQueryDto } from '../dtos/searchQuery.dto';
import { Op } from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../schemas/user.schema';
class SearchQuery extends SearchQueryDto {
  constructor(data: SearchQueryDto) {
    super();
    Object.assign(this, data);
  }
  generateQuery() {
    const query = {};
    if (this.from) {
      query['createdAt'] = {
        [Op.gte]: this.from,
      };
    }
    if (this.to) {
      query['createdAt'] = {
        [Op.lte]: this.to,
      };
    }
    if (this.name) {
      query['name'] = {
        [Op.like]: `%${this.name}%`,
      };
    }
    if (this.sort) {
      query['sort'] = this.sort;
    }
    if (this.membership) {
      query['membership'] = this.membership;
    }
    return query;
  }
}
@Injectable()
export class SearchService {
  constructor(@InjectModel(User) private userModel: typeof User) {}
  async search(query: SearchQueryDto): Promise<User[]> {
    const searchQuery = new SearchQuery(query);
    return await this.userModel.findAll({
      where: searchQuery.generateQuery(),
    });
  }
}
