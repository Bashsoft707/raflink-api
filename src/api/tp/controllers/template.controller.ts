import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { TemplateService } from '../services/template.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import {
  CreateTemplateDto,
  CreateUserTemplateDto,
  UpdateTemplateDto,
  UpdateUserTemplateDto,
} from '../dtos';
import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { TokenData } from '../../../api/authentication/dtos';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create general templates' })
  async createTemplate(@Body() body: CreateTemplateDto) {
    return await this.templateService.createTemplate(body);
  }

  @Get('/')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get templates' })
  async getTemplate() {
    return await this.templateService.findAllTemplates();
  }

  @Patch('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update general template' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the template to update',
    required: true,
    type: String,
  })
  async updateTemplate(
    @Param() param: { id: string },
    @Body() body: UpdateTemplateDto,
  ) {
    return await this.templateService.updateTemplate(param.id, body);
  }

  @Delete('/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to delete general templates' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the template to delete',
    required: true,
    type: String,
  })
  async deleteTemplate(@Param() param: { id: string }) {
    return await this.templateService.deleteTemplate(param.id);
  }

  @Post('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create user template' })
  async createUserTemplate(
    @Req() req: Request,
    @Body() body: CreateUserTemplateDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.templateService.createUserTemplate(user as any, body);
  }

  @Get('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get user templates' })
  async getUserTemplates(@Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.templateService.findUserTemplates(user);
  }

  @Patch('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to update user template' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user template to update',
    required: true,
    type: String,
  })
  async updateUserTemplate(
    @Param() param: { id: string },
    @Req() req: Request,
    @Body() body: UpdateUserTemplateDto,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.templateService.updateUserTemplate(param.id, user, body);
  }

  @Delete('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to delete user template' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user template to delete',
    required: true,
    type: String,
  })
  async deleteUserTemplate(
    @Param() param: { id: string },
    @Req() req: Request,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.templateService.deleteUserTemplate(param.id, user);
  }
}
