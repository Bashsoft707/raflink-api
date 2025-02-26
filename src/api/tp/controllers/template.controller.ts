import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TemplateService } from '../services/template.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateTemplateDto, CreateUserTemplateDto } from '../dtos';
import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { TokenData } from '../../../api/authentication/dtos';

@ApiTags('templates')
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('')
  @UseGuards(AccessTokenGuard)
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

  @Post('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to create user template' })
  async createUserTemplate(@Req() req: Request, @Body() body: CreateUserTemplateDto) {
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
}
