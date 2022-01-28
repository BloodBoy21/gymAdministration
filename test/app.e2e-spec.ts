import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

describe('AppController (e2e)', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestExpressApplication>();
    app.setViewEngine('hbs');
    app.useStaticAssets(join(__dirname, '../src', 'public'));
    app.setBaseViewsDir(join(__dirname, '../src', 'views'));
    await app.init();
  });
  afterAll(async () => {
    app.close();
  });
  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });
});
