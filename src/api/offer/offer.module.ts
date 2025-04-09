import { Module } from '@nestjs/common';
import { OfferService } from './services/offer.service';
import { OfferController } from './controllers/offer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schema';
import { Category, CategorySchema } from '../links/schema/category.schema';

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
  ],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
