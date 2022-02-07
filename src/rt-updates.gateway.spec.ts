import { Test, TestingModule } from '@nestjs/testing';
import { RtUpdatesGateway } from './rt-updates.gateway';
import { User } from './schemas/user.schema';
import { UserDto } from './users/dto/user.dto';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';
import { UsersService } from './users/users.service';
class UsersServiceMock {
  getUsers() {
    return Promise.resolve([
      {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@admin.com',
        membership: 'gold',
      } as unknown as User,
      {
        id: '2',
        firstName: 'Alan',
        lastName: 'Doe',
        email: 'alan@admin.com',
        membership: 'standard',
      } as unknown as User,
    ]);
  }
  getUser() {
    return Promise.resolve({
      id: '1',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@admin.com',
      membership: 'gold',
    } as User);
  }
  updateUser(_: string, userData: UserDto) {
    return Promise.resolve(userData as UserWsTransferDto);
  }
}

describe('RtUpdatesGateway', () => {
  let gateway: RtUpdatesGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RtUpdatesGateway,
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
      ],
    }).compile();

    gateway = module.get<RtUpdatesGateway>(RtUpdatesGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
  it('should return an array of users', async () => {
    const data = await gateway.handleGetUsers();
    const users = JSON.parse(data.data);
    expect(data.event).toEqual('getUsers');
    expect(users).toHaveLength(2);
    expect(users[0].firstName).toEqual('Jane');
    expect(users[1].firstName).toEqual('Alan');
  });
  it('should return a user', async () => {
    const data = await gateway.handleGetUser(null, {
      id: '1',
    });
    const user = JSON.parse(data.data);
    expect(data.event).toEqual('getUser');
    expect(user.firstName).toEqual('Jane');
    expect(user.lastName).toEqual('Doe');
  });
  it('should update the user', async () => {
    const data = await gateway.handleUpdate(null, {
      id: '1',
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jan23@admin.com',
        membership: 'platinum',
      },
    });
    const user = JSON.parse(data.data);
    expect(data.event).toEqual('updateUser');
    expect(user.firstName).toEqual('Jane');
  });
});
