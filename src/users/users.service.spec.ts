import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';

const users: User[] = [
  {
    id: '1',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan@admin.com',
    membership: 'standard',
    isActive: true,
    membershipExpiration: new Date('2022-07-01'),
    createdAt: new Date('2020-01-01'),
  } as User,
  {
    id: '2',
    firstName: 'Alan',
    lastName: 'Balcazar',
    email: 'alan2@admin.com',
    membership: 'gold',
    isActive: true,
    membershipExpiration: new Date('2022-07-01'),
    createdAt: new Date('2020-02-01'),
  } as User,
];

class UserMock {
  constructor(private data) {}
  static findAll = jest.fn().mockResolvedValue(users);
  static findByPk = jest.fn().mockImplementation((id) => {
    return users.find((user) => user.id === id);
  });
  static update = jest.fn().mockImplementation((user: UserDto, query) => {
    const index = users.findIndex((u) => u.id === query.where.id);
    users[index] = Object.assign(users[index], user);
    return [1, [users[index]]];
  });
  static destroy = jest.fn().mockResolvedValue(1);
  save = jest.fn(() => this.data as User);
  update = jest.fn();
  static toCsv = jest.fn().mockResolvedValue([
    {
      id: '1',
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@admin.com',
      membership: 'standard',
      isActive: true,
      membershipExpiration: new Date().toLocaleDateString(),
    },
  ]);
}

class MailServiceMock {
  newMember = jest.fn(() => Promise.resolve());
  send = jest.fn();
}

describe('UsersService', () => {
  let service: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: MailService,
          useClass: MailServiceMock,
        },
        {
          provide: getModelToken(User),
          useValue: UserMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should add an new user', async () => {
    const user = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'joe@admin.com',
      membership: 'gold',
    };
    const result = await service.addUser(user);
    expect(result.firstName).toBe(user.firstName);
    expect(result.lastName).toBe(user.lastName);
    expect(result.email).toBe(user.email);
    expect(result.membership).toBe(user.membership);
  });
  it('should return the user selected', async () => {
    const result = await service.getUser('1');
    expect(result.firstName).toBe('Alan');
  });
  it('should return all users', async () => {
    const users = await service.getUsers();
    expect(users.length).toBe(2);
    expect(users[0].firstName).toBe('Alan');
    expect(users[1].lastName).toBe('Balcazar');
  });
  it('should update the user', async () => {
    const user = {
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@test.com',
      membership: 'gold',
    } as UserDto;
    const result = await service.updateUser('1', user);
    expect(result.email).toBe(user.email);
    expect(result.membership).toBe(user.membership);
  });
  it('should delete the user', async () => {
    const result = await service.deleteUser('1');
    expect(result).toBe(true);
  });
  it('should return a csv string', async () => {
    const result = await service.exportUsersToCsv();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
