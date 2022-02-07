import { Injectable } from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class AlertsService {
  private readonly usersService: UsersService;
  private readonly mailService: MailService;
  constructor(mailService: MailService, usersService: UsersService) {
    this.mailService = mailService;
    this.usersService = usersService;
  }
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    timeZone: 'America/Mexico_City',
  })
  async membershipWillExpire() {
    const tomorrow = new Date().setDate(new Date().getDate() + 1);
    const users = await this.usersService.getUsersToSendMail(
      new Date(tomorrow),
    );
    users.map(async (user) => {
      await this.mailService.membershipExpiration(user);
    });
  }
}
