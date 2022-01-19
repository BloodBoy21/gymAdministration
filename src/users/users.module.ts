import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { InjectModel, SequelizeModule } from '@nestjs/sequelize';
import { User } from '../schemas/user.schema';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(User) private readonly user: User,
  ) {
    this.user.sequelize.sync({ force: true });
  }
}
