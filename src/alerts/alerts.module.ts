import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AlertsService } from './alerts.service';

@Module({
  providers: [AlertsService],
  imports: [UsersModule],
})
export class AlertsModule {
  private alertService: AlertsService;
  constructor(alertService: AlertsService) {
    this.alertService = alertService;
  }
  async onModuleInit(): Promise<void> {
    await this.alertService.membershipWillExpire();
  }
}
