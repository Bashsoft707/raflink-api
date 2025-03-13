import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AccessTokenGuard } from '../../authentication/auth';
import { Request } from 'express';
import { TokenData } from '../../authentication/dtos';
// import { CreateTransactionDto } from '../dto';
import { TransactionService } from '../services/transaction.service';
import { TransactionFilterDTO } from '../dto';

@ApiTags('transaction')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  // @Post('/new')
  // @UseGuards(AccessTokenGuard)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Endpoint to create Transaction' })
  // async createTransaction(@Req() req: Request, @Body() body: CreateTransactionDto) {
  //   const { user: tokenData } = req;
  //   const { user } = tokenData as unknown as TokenData;
  //   return await this.transactionService.createTransaction(user as any, body);
  // }

  @Get('/user')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all user Transactions' })
  async getUserTransactions(
    @Req() req: Request,
    @Query() query: TransactionFilterDTO,
  ) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;
    return await this.transactionService.getUserTransactions(user, query);
  }

  @Get('/user/:id')
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single user Transaction detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Transaction to be fetched',
    required: true,
    type: String,
  })
  async getTransaction(@Param() param: { id: string }, @Req() req: Request) {
    const { user: tokenData } = req;
    const { user } = tokenData as unknown as TokenData;

    return await this.transactionService.getUserTransactionById(user, param.id);
  }

  @Get('/')
  // @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get all Transactions' })
  async getTransactions(@Query() query: TransactionFilterDTO) {
    return await this.transactionService.getTransactions(query);
  }

  @Get('/:id')
  // @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Endpoint to get single Transaction detail' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the Transaction to be fetched',
    required: true,
    type: String,
  })
  async getSingleTransaction(@Param() param: { id: string }) {
    return await this.transactionService.getSingleTransaction(param.id);
  }
}
