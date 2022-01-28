import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../schemas/user.schema';
import { SearchQueryDto } from '../dtos/searchQuery.dto';
describe('SearchService', () => {
  let service: SearchService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: getModelToken(User),
          useValue: {
            findAll: jest.fn().mockImplementation(() => {
              const users: User[] = [
                {
                  id: '1',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  email: 'janed2@admin.com',
                  membership: 'gold',
                } as User,
                {
                  id: '2',
                  firstName: 'Jane',
                  lastName: 'Doff',
                  email: 'jane@admin.com',
                  membership: 'standard',
                } as User,
              ];
              return users;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return an array of search results', async () => {
    const query: SearchQueryDto = {
      name: 'Jane',
    };
    const result = await service.search(query);
    expect(result).toHaveLength(2);
    expect(result[0].firstName).toEqual('Jane');
  });
});
