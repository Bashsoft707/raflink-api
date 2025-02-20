import { Module } from '@nestjs/common';
import { TemplateService } from './services/template.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CachesModule } from '../cache/cache.module';
import {
  UserTemplate,
  UserTemplateSchema,
} from './schema/user-template.schema';
import { Template, TemplateSchema } from './schema/template.schema';
import { TemplateController } from './controllers/template.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserTemplate.name,
        schema: UserTemplateSchema,
      },
      {
        name: Template.name,
        schema: TemplateSchema,
      },
    ]),
    CachesModule,
  ],
  providers: [TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
