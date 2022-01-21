import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { RtUpdatesGateway } from './rt-updates.gateway';
import { MailModule } from './mail/mail.module';
import { ConfigModule } from '@nestjs/config';
import { AlertsModule } from './alerts/alerts.module';
import { ScheduleModule } from '@nestjs/schedule';
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
    MailModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AlertsModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, RtUpdatesGateway],
})
export class AppModule {
  /* constructor(private readonly alerts: AlertsModule) {
    this.alerts.onModuleInit();
  } */
}
