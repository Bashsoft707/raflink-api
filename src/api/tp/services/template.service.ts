import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateTemplateDto,
  CreateUserTemplateDto,
  UpdateTemplateDto,
  UpdateUserTemplateDto,
} from '../dtos';
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

  async updateTemplate(id: string, updateTemplateDto: UpdateTemplateDto) {
    try {
      const template = await this.templateModel.findById(id);

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      const updatedTemplate = await this.templateModel.findByIdAndUpdate(
        id,
        updateTemplateDto,
        { new: true },
      );

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Template updated successfully.',
        data: updatedTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async deleteTemplate(id: string) {
    try {
      const template = await this.templateModel.findById(id);

      if (!template) {
        throw new NotFoundException('Template not found');
      }

      await template.deleteOne();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'Template deleted successfully.',
        data: null,
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

      const userTemplate = await this.userTemplateModel.findOneAndUpdate(
        { userId },
        {
          userId,
          templateId: baseTemplate._id,
          name: baseTemplate.name,
          backgroundImage: baseTemplate.backgroundImage,
          backgroundColor: baseTemplate.backgroundColor,
          textColor: baseTemplate.textColor,
          subtitleColor: baseTemplate.subtitleColor,
          containerColor: baseTemplate.containerColor,
          templateStyle: baseTemplate.templateStyle,
          socialLinksStyle: baseTemplate.socialLinksStyle,
          linkStyle: baseTemplate.linkStyle,
          socialLinksPosition: baseTemplate.socialLinksPosition,
        },
        { upsert: true, new: true },
      );

      if (!userTemplate) {
        throw new BadRequestException('Failed to create/update user template');
      }

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User template created/updated successfully',
        data: userTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async findUserTemplates(userId: Types.ObjectId) {
    try {
      const userTemplate = await this.userTemplateModel
        .findOne({ userId })
        .populate('userId', 'bio socialLinks')
        .exec();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User templates retrieved successfully.',
        data: userTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async updateUserTemplate(
    id: string,
    user: Types.ObjectId,
    updateTemplateDto: UpdateUserTemplateDto,
  ) {
    try {
      const userTemplate = await this.userTemplateModel.findById(id);

      if (!userTemplate) {
        throw new NotFoundException('User template not found');
      }

      if (userTemplate.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Template doesn't belong to user");
      }

      const updatedUserTemplate =
        await this.userTemplateModel.findByIdAndUpdate(id, updateTemplateDto, {
          new: true,
        });

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User template updated successfully.',
        data: updatedUserTemplate,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }

  async deleteUserTemplate(id: string, user: Types.ObjectId) {
    try {
      const userTemplate = await this.userTemplateModel.findById(id);

      if (!userTemplate) {
        throw new NotFoundException('User template not found');
      }

      if (userTemplate.userId?.toString() !== user.toString()) {
        throw new BadRequestException("Template doesn't belong to user");
      }

      await userTemplate.deleteOne();

      return {
        status: 'success',
        statusCode: HttpStatus.OK,
        message: 'User template deleted successfully.',
        data: null,
        error: null,
      };
    } catch (error) {
      errorHandler(error);
    }
  }
}
