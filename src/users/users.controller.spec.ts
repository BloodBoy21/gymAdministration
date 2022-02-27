import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';
import { UsersController } from './users.controller';
import { getExpirationDate, UsersService } from './users.service';
const users: User[] = [
  {
    id: '1',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan@admin.com',
    membership: 'Gold',
    membershipExpiration: new Date(),
    joinedAt: new Date(),
    isActive: true,
  } as unknown as User,
];
const uid = () => {
  const head = Date.now().toString(36);
  const tail = Math.random().toString(36).substring(2);
  return head + tail;
};
class UsersServiceMock {
  addUser(userData: UserDto) {
    const user: User = Object.assign(
      {
        id: uid(),
        membershipExpiration: getExpirationDate(userData.membership),
        joinedAt: new Date(),
      },
      userData,
    ) as User;
    return Promise.resolve({
      user,
      error: null,
    });
  }
  getUsers(): Promise<UserWsTransferDto[]> {
    return Promise.resolve(
      users.map((user) => new UserWsTransferDto().send(user)),
    );
  }
  updateUser(id: string, userToUpdate: UserDto): Promise<UserWsTransferDto> {
    let user = users.find((u) => u.id === id);
    user = Object.assign(user, userToUpdate);
    return Promise.resolve(new UserWsTransferDto().send(user));
  }
  deleteUser(id: string): Promise<UserWsTransferDto> {
    const user = users.find((u) => u.id === id);
    users.splice(users.indexOf(user), 1);
    return Promise.resolve(new UserWsTransferDto().send(user));
  }
}
describe('UsersController', () => {
  let controller: UsersController;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
        {
          provide: MailService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should add a new user', async () => {
    const user = await controller.addUser({
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@admin.com',
      membership: 'gold',
    });
    const membershipExpiration = getExpirationDate(
      'gold',
      new Date(),
    ).toLocaleDateString();
    expect(user).toBeDefined();
    expect(user.firstName).toEqual('Alan');
    expect(user.membershipExpiration.toLocaleDateString()).toEqual(
      membershipExpiration,
    );
  });
  it('should return all users', async () => {
    const usersList = await controller.getUsers();
    expect(usersList).toBeDefined();
    expect(usersList.length).toEqual(1);
    expect(usersList[0].firstName).toEqual('Alan');
  });
  it('should update the user', async () => {
    const user = await controller.updateUser('1', {
      firstName: 'Pedro',
      lastName: 'Alvares',
    } as UserDto);
    expect(user).toBeDefined();
    expect(user.firstName).toEqual('Pedro');
  });
  it('should delete an user', async () => {
    const response = await controller.deleteUser('1');
    expect(response).toBeDefined();
    expect(response.status).toEqual(204);
    expect(response.error).toBeNull();
  });
});
