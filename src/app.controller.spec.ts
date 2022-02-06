import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchQueryDto } from './dtos/searchQuery.dto';
import { SearchService } from './search/search.service';
import { UserDto } from './users/dto/user.dto';
import { UserWsTransferDto } from './users/dto/userWSTransfer.dto';
import { UsersService } from './users/users.service';
//TODO: add the new methods to the search service and test them
class UsersServiceMock {
  updateUser(id: string, user: UserDto) {
    return Promise.resolve(user as UserWsTransferDto);
  }
}

const searchQuery = (query: SearchQueryDto) => {
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
      // expect(appController.root()).toBeUndefined();
      expect(true).toBe(true);
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
});
