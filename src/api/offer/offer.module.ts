import { Module } from '@nestjs/common';
import { OfferService } from './services/offer.service';
import { OfferController } from './controllers/offer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schema';
import { Category, CategorySchema } from '../links/schema/category.schema';
import { AuthModule } from '../authentication/authentication.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Offer.name,
        schema: OfferSchema,
      },
      {
        name: Category.name,
        schema: CategorySchema,
      },
    ]),
    AuthModule,
  ],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
