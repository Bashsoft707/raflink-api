import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './helpers';
import helmet from 'helmet';
import { ENV } from './constants';
import basicAuth from 'express-basic-auth';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    cors: true,
  });

  app.use(
    express.json({
      verify: (req: any, res: any, buf: Buffer, encoding: string) => {
        if (buf && buf.length) {
          (req as any).rawBody = buf;
        }
      },
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: [
      'https://raflink.vercel.app',
      'http://localhost:5173',
      'https://raflinks.io',
      'https://staging.raflinks.io',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
  });

  // app.use(
  //   helmet({
  //     crossOriginResourcePolicy: { policy: 'cross-origin' },
  //     crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  //     contentSecurityPolicy: {
  //       directives: {
  //         defaultSrc: [`'self'`],
  //         scriptSrc: [`'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com'],
  //         styleSrc: [`'self'`, `'unsafe-inline'`, 'cdnjs.cloudflare.com'],
  //         imgSrc: [`'self'`, 'data:'],
  //       },
  //     },
  //   }),
  // );

  const SWAGGER_ENVS = ['development', 'local'];

  // if (SWAGGER_ENVS.includes(ENV.NODE_DEV)) {
  app.use(
    ['/api'],
    basicAuth({
      challenge: true,
      users: {
        [ENV.SWAGGER_USER]: ENV.SWAGGER_PASSWORD,
      },
    }),
  );
  // }

  const config = new DocumentBuilder()
    .setTitle('Raflink')
    .setDescription('Raflink API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .setExternalDoc('Postman Collection', '/api-json')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Raflink API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: ['/swagger-ui-bundle.js', '/swagger-ui-standalone-preset.js'],
    customCssUrl: ['/swagger-ui.css'],
  });

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useBodyParser('json', { limit: '10mb' });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
