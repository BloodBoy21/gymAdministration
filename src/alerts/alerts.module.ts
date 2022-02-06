import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AlertsService } from './alerts.service';

@Module({
  providers: [AlertsService],
  imports: [UsersModule],
})
export class AlertsModule {
  constructor(private alertService: AlertsService) {}
  onModuleInit(): void {
    this.alertService.membershipWillExpire();
  }
}
