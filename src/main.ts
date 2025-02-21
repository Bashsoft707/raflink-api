import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from 'src/helpers';
import helmet from 'helmet';
import { ENV } from 'src/constants';
import basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const SWAGGER_ENVS = ['development', 'local'];

  if (SWAGGER_ENVS.includes(ENV.NODE_DEV)) {
    app.use(
      ['/api'],
      basicAuth({
        challenge: true,
        users: {
          [ENV.SWAGGER_USER]: ENV.SWAGGER_PASSWORD,
        },
      }),
    );
    const config = new DocumentBuilder()
      .setTitle('Raflink')
      .setDescription('Raflink API documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .setExternalDoc('Postman Collection', '/api-json')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.use(helmet());
  app.enableCors();
  app.useBodyParser('json', { limit: '10mb' });
  await app.listen(process.env.PORT || 4000);
}
bootstrap();
