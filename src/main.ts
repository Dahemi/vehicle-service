import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);
  if(dataSource.isInitialized){
    console.log('Connected to database successfully');
  }
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
