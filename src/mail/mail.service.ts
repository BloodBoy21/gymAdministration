import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../schemas/user.schema';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class MailService {
  constructor(
    private readonly config: ConfigService,
    private readonly mailerService: MailerService,
  ) {}
  async newMember(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Welcome to the Gym',
      template: 'newMember',
      context: {
        name: user.firstName,
        membership: user.membership,
        expiration: user.membershipExpiration.toLocaleDateString(),
        gym: this.config.get('GYM_NAME'),
      },
    });
  }
}
