import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { InjectModel, SequelizeModule } from '@nestjs/sequelize';
import { User } from '../schemas/user.schema';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [SequelizeModule.forFeature([User]), MailModule],
  providers: [UsersService],
  exports: [UsersService, SequelizeModule],
})
export class UsersModule {
  constructor(
    private readonly usersService: UsersService,
    @InjectModel(User) private readonly user: User,
  ) {
    this.user.sequelize.sync({ alter: true });
  }
}
