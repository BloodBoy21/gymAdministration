import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { User } from '../schemas/user.schema';
import { UserDto } from './dto/user.dto';
import { UserWsTransferDto } from './dto/userWSTransfer.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: MailService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(UsersService)
      .useValue(jest.fn())
      .compile();
    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('should add a new user', async () => {
    usersService.addUser = jest.fn().mockImplementation((user: UserDto) => {
      const newUser: UserWsTransferDto = Object.assign(
        {
          id: '1',
          isActive: true,
          membershipExpiration: new Date('2020-02-01'),
        },
        user,
      );
      return newUser;
    });
    const user = await controller.addUser({
      firstName: 'Alan',
      lastName: 'Turing',
      email: 'alan@admin.com',
      membership: 'gold',
    });
    expect(usersService.addUser).toHaveBeenCalled();
    expect(user).toBeDefined();
    expect(user.firstName).toEqual('Alan');
    expect(user.membershipExpiration).toEqual(new Date('2020-02-01'));
  });
  it('should return all users', async () => {
    usersService.getUsers = jest.fn().mockImplementation(() => {
      return [
        {
          id: '1',
          firstName: 'Alan',
          lastName: 'Turing',
          email: 'alan@admin.com',
        },
      ];
    });
  });
  it('should return the new data from the user selected', async () => {
    usersService.updateUser = jest
      .fn()
      .mockImplementation((id: string, user: UserDto) => {
        const users: User[] = [
          {
            id: '1',
            firstName: 'Alan',
            lastName: 'Turing',
          } as unknown as User,
        ];
        const userToUpdate: UserWsTransferDto = users.filter(
          (user) => user.id === id,
        )[0];
        const updatedUser: UserWsTransferDto = Object.assign(
          userToUpdate,
          user,
        );
        return updatedUser;
      });
    const user = await controller.updateUser('1', {
      firstName: 'Pedro',
      lastName: 'Alvares',
    } as UserDto);
    expect(usersService.updateUser).toHaveBeenCalled();
    expect(user).toBeDefined();
    expect(user.firstName).toEqual('Pedro');
  });
  it('should delete an user', async () => {
    usersService.deleteUser = jest.fn().mockImplementation(() => {
      return true;
    });
    const response = await controller.deleteUser('1');
    expect(usersService.deleteUser).toHaveBeenCalled();
    expect(response).toBeDefined();
    expect(response.status).toEqual(204);
    expect(response.error).toBeNull();
  });
});
