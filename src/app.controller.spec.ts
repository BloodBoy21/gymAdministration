import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchQueryDto } from './dtos/searchQuery.dto';
import { SearchService } from './search/search.service';
import { UserDto } from './users/dto/user.dto';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';
import { getExpirationDate, UsersService } from './users/users.service';

//TODO: add the new methods to the search service and test them
const users: UserWsTransferDto[] = [
  {
    id: '12',
    firstName: 'Alan',
    lastName: 'Balcazar',
    email: 'alanB@admin.com',
    membership: 'Gold',
    membershipExpiration: new Date('2020-04-01'),
    isActive: true,
  },
  {
    id: '1',
    firstName: 'Alan',
    lastName: 'Turing',
    email: 'alan@admin.com',
    membership: 'Gold',
    membershipExpiration: new Date('2020-03-01'),
    isActive: true,
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'von Neumann',
    email: 'john@admin.com',
    membership: 'Platinum',
    membershipExpiration: new Date('2020-02-01'),
    isActive: true,
  },
];
class UsersServiceMock {
  updateUser(id: string, userToUpdate: UserDto) {
    let user = users.find((u) => u.id === id);
    const { date, ...userWithoutDate } = userToUpdate;
    user = Object.assign(user, userWithoutDate);
    user.membershipExpiration = getExpirationDate(user.membership, date);
    return Promise.resolve(user);
  }
  getUser(id: string) {
    return Promise.resolve(users.find((user) => user.id === id));
  }
}

const searchQuery = (query: SearchQueryDto) => {
  const usersMatch: UserWsTransferDto[] = users.filter(
    (user: UserWsTransferDto) => {
      if (
        query.firstName &&
        user.firstName.toLowerCase().includes(query.firstName.toLowerCase())
      ) {
        return true;
      }
      if (
        query.membership &&
        user.membership.toLowerCase().includes(query.membership.toLowerCase())
      ) {
        return true;
      }
      return false;
    },
  );
  if (usersMatch.length > 0) return Promise.resolve(usersMatch);
  return Promise.reject(new Error('No users found'));
};

describe('AppController', () => {
  let appController: AppController;
  let searchService: SearchService;
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: SearchService,
          useValue: {
            search: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useClass: UsersServiceMock,
        },
      ],
    }).compile();
    appController = app.get<AppController>(AppController);
    searchService = app.get<SearchService>(SearchService);
    jest.spyOn(searchService, 'search').mockImplementation(searchQuery);
  });

  describe('root', () => {
    it('should return void', () => {
      expect(appController.root()).toBe(null);
    });
  });
  describe('search', () => {
    it('should return an array  of users', async () => {
      const users = await appController.searchForm({ firstName: 'Alan' });
      expect(users).toHaveLength(2);
      expect(users[0].firstName).toBe('Alan');
      expect(users[1].firstName).toBe('Alan');
      expect(users[0].lastName !== users[1].lastName).toBe(true);
    });
  });
  describe('update user', () => {
    it('GET should return data from the user', async () => {
      const resMock: Response = {
        render: () => null,
      } as unknown as Response;
      const user = await appController.viewUpdateUser('1', resMock);
      expect(user).toBe(users[1]);
    });
    it('POST should update -user/:id', async () => {
      const newUserData: UserDto = {
        firstName: 'Alan',
        lastName: 'Balcazar',
        email: 'test@admin.com',
        membership: 'Platinum',
      };
      const user = await appController.updateUserHandler('1', newUserData);
      expect(user.lastName).toBe('Balcazar');
      expect(user.email).toBe('test@admin.com');
    });
    it('POST should update -user/:id with custom date to membership', async () => {
      const newUserData: UserDto = {
        firstName: 'Alan',
        lastName: 'Turing',
        email: 'alancrister90@gmail.com',
        membership: 'Gold',
        date: new Date('2022-02-22'),
      };
      const monthInMs = 60 * 60 * 24 * 30 * 1000;
      const sixMonthsFromDate =
        new Date('2022-02-22').getTime() + monthInMs * 6;
      const user = await appController.updateUserHandler('1', newUserData);
      expect(user.membershipExpiration.toDateString()).toBe(
        new Date(sixMonthsFromDate).toDateString(),
      );
    });
  });
});
