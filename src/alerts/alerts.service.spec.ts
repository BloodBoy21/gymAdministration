import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { UsersService } from '../users/users.service';
import { AlertsService } from './alerts.service';

describe('AlertsService', () => {
  let service: AlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: MailService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            getUsersToSendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
