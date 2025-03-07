import { Module } from '@nestjs/common';
import { OfferService } from './services/offer.service';
import { OfferController } from './controllers/offer.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Offer, OfferSchema } from './schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Offer.name,
        schema: OfferSchema,
      },
    ]),
  ],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
