import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as es6Render from 'express-es6-template-engine';
import * as morgan from 'morgan';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
const configService = new ConfigService();
const logger = new Logger('Bootstrap');
const port: number = configService.get('PORT') || 3000;
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(morgan('dev'));
  app.useStaticAssets(join(__dirname, '../src', 'public'));
  app.setBaseViewsDir(join(__dirname, '../src', 'views'));
  app.engine('html', es6Render);
  app.setViewEngine('html');
  app.enableCors();
  await app.listen(port);
}
bootstrap()
  .then(() => logger.log(`Application is running on: http://localhost:${port}`))
  .catch((err) => logger.error(err));
