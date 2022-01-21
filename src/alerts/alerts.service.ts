import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class AlertsService {
  constructor(
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/Mexico_City',
  })
  async membershipWillExpire() {
    const tomorrow = new Date().setDate(new Date().getDate() + 1);
    const users = await this.usersService.getUsersToSendMail(
      new Date(tomorrow),
    );
    users.forEach((user) => {
      this.mailService.membershipExpiration(user);
    });
  }
}
