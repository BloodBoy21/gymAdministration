import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
const dayInMs = 24 * 60 * 60 * 1000;
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
  constructor(data: Partial<User>) {
    Object.assign(this, data);
  }
  static findAll = jest.fn().mockResolvedValue(users);
  static findByPk = jest.fn().mockImplementation((id) => {
    const user = users.find((user) => user.id === id);
    return new UserMock(user);
  });
  static update = jest.fn().mockImplementation((user: UserDto, query) => {
    const index = users.findIndex((u) => u.id === query.where.id);
    users[index] = Object.assign(users[index], user);
    return [1, [new UserMock(users[index])]];
  });
  static destroy = jest.fn().mockResolvedValue(1);
  save = jest
    .fn()
    .mockImplementation(() => new Promise<void>((resolve) => resolve()));
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
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'joe@admin.com',
      membership: 'gold',
    };
    const { user, error } = await service.addUser(newUser);
    expect(user.firstName).toBe(user.firstName);
    expect(user.lastName).toBe(user.lastName);
    expect(user.email).toBe(user.email);
    expect(user.membership).toBe(user.membership);
    expect(error).toBeNull();
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
  it('should reactivate a user', async () => {
    const result = await service.reActivateMembership('1');
    const today: Date = new Date();
    expect(result.isActive).toBe(true);
    expect(result.membershipExpiration.toLocaleDateString()).toBe(
      new Date(today.getTime() + 180 * dayInMs).toLocaleDateString(),
    );
  });
  it('should return all the user with date expired', async () => {
    const result = await service.getUsersToSendMail(new Date());
    expect(result).toBe(users);
  });
  it('should return a csv string', async () => {
    const result = await service.exportUsersToCsv();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
