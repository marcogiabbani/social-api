import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;
  const MODE = process.env.NODE_ENV || 'development';
  await app.listen(PORT, () => {
    console.log(`Server is running in ${MODE} mode on port: ${PORT}`);
  });
}
bootstrap();
