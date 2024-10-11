import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
        .setTitle('Nest JS Rick and Morty API')
        .setDescription('Set up of an API that consumes the Rick and Morty api at https:rickandmortyapi.com')
        .setVersion('1.0.0')
        .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api-docs', app, document); 

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
