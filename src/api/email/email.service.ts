import { Injectable, Logger } from '@nestjs/common';
import { IEmailService, ISendEmailBody } from './email.interface';
// import mail from '@sendgrid/mail';
import { EmailTemplateLoader } from './email-template-loader';
import { ConfigService } from '@nestjs/config';
import { ENV, NODE_ENV } from 'src/constants';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly _emailTemplate: EmailTemplateLoader,
    private readonly configService: ConfigService,
  ) {}

  template(data: ISendEmailBody) {
    return `
                <h1>RAFLINK</h1>
                <h3>${data.body}</h3>
                `;
  }

  // async sendEmail(data: ISendEmailBody) {
  //   // console.log(data, this.configService.get(ENV.SENDGRID_KEY));
  //   if (process.env.NODE_ENV === NODE_ENV.PROD) {
  //     try {
  //       mail.setApiKey(this.configService.get(ENV.SENDGRID_KEY));
  //       let template = this._emailTemplate
  //         .getTemplate((<any>data).templateKey, data.data)
  //         .toString();
  //       if (template.includes('supported')) template = this.template(data);

  //       const msg = {
  //         to: data.receiver,
  //         from: {
  //           email: this.configService.get(ENV.COMPANY_EMAIL),
  //           name: 'raflink',
  //         },
  //         subject: data.subject,
  //         html: template,
  //       };
  //       await mail.send(msg);
  //       this.logger.log('Email sent');
  //     } catch (error) {
  //       this.logger.log('Error sending email');
  //       this.logger.error(error);
  //       this.logger.log(error.response.body);

  //       return false;
  //     }
  //   } else {
  //     this.logger.log('Email sending disabled in DEV ENVIRONMENT');
  //   }
  // }

  async sendEmail(): Promise<boolean> {
    return true;
  }
}
