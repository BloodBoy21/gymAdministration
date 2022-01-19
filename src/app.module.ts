import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { RtUpdatesGateway } from './rt-updates.gateway';
@Module({
  imports: [
    UsersModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'gym',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
    }),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, RtUpdatesGateway],
})
export class AppModule {}
