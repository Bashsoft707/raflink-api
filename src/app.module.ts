import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './api/authentication/authentication.module';
import { CachesModule } from './api/cache/cache.module';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { TemplateModule } from './api/tp/template.module';
import { CloudinaryModule } from './api/cloudinary/cloudinary.module';
import { StripeModule } from './api/stripe/stripe.module';
import { SubscriptionModule } from './api/subscription/subscription.module';
import { LinkModule } from './api/links/link.module';
import { OfferModule } from './api/offer/offer.module';
import { TransactionModule } from './api/transaction/transaction.module';
// import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    CommonModule,
    MulterModule.register({
      dest: './uploads',
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
    }),
    AuthModule,
    CachesModule,
    TemplateModule,
    LinkModule,
    OfferModule,
    CloudinaryModule,
    StripeModule.forRootAsync(),
    SubscriptionModule,
    TransactionModule,
    // AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: LoggerInterceptor,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}
