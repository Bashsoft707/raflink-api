import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTemplateDto, CreateUserTemplateDto } from '../dtos';
import { errorHandler } from '../../../utils';
import {
  UserTemplate,
  UserTemplateDocument,
} from '../schema/user-template.schema';
import { Template, TemplateDocument } from '../schema/template.schema';

@Injectable()
export class TemplateService {
  constructor(
    @InjectModel(Template.name)
    private readonly templateModel: Model<TemplateDocument>,
    @InjectModel(UserTemplate.name)
    private readonly userTemplateModel: Model<UserTemplateDocument>,
  ) {}

  async createTemplate(createTemplateDto: CreateTemplateDto) {
    try {
      const newTemplate = await this.templateModel.create(createTemplateDto);

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Template created successfully.',
        data: newTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async findAllTemplates() {
    try {
      const templates = await this.templateModel.find().exec();

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Templates retrieved successfully.',
        data: templates,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async createUserTemplate(
    userId: string,
    createUserTemplateDto: CreateUserTemplateDto,
  ) {
    try {
      const baseTemplate = await this.templateModel
        .findById(createUserTemplateDto.templateId)
        .exec();

      if (!baseTemplate) {
        throw new NotFoundException('Base template not found');
      }

      const userTemplate = await this.userTemplateModel.create({
        userId,
        templateId: baseTemplate._id,
        name: createUserTemplateDto.name || baseTemplate.name,
        backgroundColor:
          createUserTemplateDto.backgroundColor || baseTemplate.backgroundColor,
        socialLinksPosition:
          createUserTemplateDto.socialLinksPosition ||
          baseTemplate.socialLinksPosition,
        affiliateLinks: createUserTemplateDto.affiliateLinks,
      });

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User template created successfully',
        data: userTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async findUserTemplates(userId: Types.ObjectId) {
    try {
      const userTemplates = await this.userTemplateModel
        .find({ userId })
        .populate('userId', 'bio socialLinks')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'User templates retrieved successfully.',
        data: userTemplates,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
