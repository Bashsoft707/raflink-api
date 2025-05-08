import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from '../email/email.service';
import { EmailTemplateLoader } from '../email/email-template-loader';
import { DomainService } from './services/domain.service';
import { DomainController } from './controllers/domain.controller';
import { StripeService } from '../stripe/service/stripe.service';
import { TransactionService } from '../transaction/services/transaction.service';
import { Transaction, TransactionSchema } from '../transaction/schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Transaction.name,
        schema: TransactionSchema,
      },
    ]),
  ],
  providers: [
    DomainService,
    EmailService,
    EmailTemplateLoader,
    StripeService,
    TransactionService,
  ],
  controllers: [DomainController],
  exports: [DomainService],
})
export class DomainModule {}
