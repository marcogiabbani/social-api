import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const PORT = configService.get('PORT') || 8080;
  const MODE = configService.get('NODE_ENV') || 'boostrapString';
  await app.listen(PORT, async () => {
    console.log(
      `Server is running in ${MODE} mode on port ${PORT}, url: ${await app.getUrl()}`,
    );
  });
}
bootstrap();
