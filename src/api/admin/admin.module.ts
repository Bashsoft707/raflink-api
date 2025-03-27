import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AdminService } from './services/admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../authentication/schema';
import { Otp, OtpSchema } from '../authentication/schema/otp.schema';
import {
  ProfileView,
  ProfileViewSchema,
} from '../authentication/schema/profileViewTime.schema';
import {
  Merchant,
  MerchantSchema,
} from '../authentication/schema/merchants.schema';
import { Offer, OfferSchema } from '../offer/schema';
import {
  Raflink,
  RaflinkSchema,
} from '../authentication/schema/raflink.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Otp.name,
        schema: OtpSchema,
      },
      {
        name: ProfileView.name,
        schema: ProfileViewSchema,
      },
      {
        name: Merchant.name,
        schema: MerchantSchema,
      },
      {
        name: Offer.name,
        schema: OfferSchema,
      },
      {
        name: Raflink.name,
        schema: RaflinkSchema,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
