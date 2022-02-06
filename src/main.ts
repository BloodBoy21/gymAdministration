import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as es6Render from 'express-es6-template-engine';
import * as morgan from 'morgan';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(morgan('dev'));
  app.useStaticAssets(join(__dirname, '../src', 'public'));
  app.setBaseViewsDir(join(__dirname, '../src', 'views'));
  app.engine('html', es6Render);
  app.setViewEngine('html');
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
