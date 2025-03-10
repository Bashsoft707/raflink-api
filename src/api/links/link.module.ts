import { Module } from '@nestjs/common';
import { LinkService } from './services/link.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CachesModule } from '../cache/cache.module';
import { Link, LinkSchema, LinkClick, LinkClickSchema } from './schema';
import { LinkController } from './controllers/link.controller';
import { User, UserSchema } from '../authentication/schema';
import { ProfileView, ProfileViewSchema } from '../authentication/schema/profileViewTime.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Link.name,
        schema: LinkSchema,
      },
      {
        name: LinkClick.name,
        schema: LinkClickSchema,
      },
      { name: User.name, schema: UserSchema },
      { name: ProfileView.name, schema: ProfileViewSchema },
    ]),
    CachesModule,
  ],
  providers: [LinkService],
  controllers: [LinkController],
  exports: [LinkService],
})
export class LinkModule {}
