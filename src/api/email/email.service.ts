import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService, ISendEmailBody } from './email.interface';
import { EmailTemplateLoader } from './email-template-loader';
import { ConfigService } from '@nestjs/config';
import { ENV, NODE_ENV } from 'src/constants';

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);

  private transporter: nodemailer.Transporter;

  constructor(
    private readonly _emailTemplate: EmailTemplateLoader,
    private readonly configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>(ENV.SMTP_HOST),
      port: this.configService.get<number>(ENV.SMTP_PORT),
      secure: false,
      auth: {
        user: this.configService.get<string>(ENV.SMTP_USER),
        pass: this.configService.get<string>(ENV.SMTP_PASS),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  template(data: ISendEmailBody) {
    return `
      <h1>RAFLINK</h1>
      <h3>${data.body}</h3>
    `;
  }

  async sendEmail(data: ISendEmailBody): Promise<boolean> {
    if (process.env.NODE_ENV === NODE_ENV.PROD) {
      try {
        let template = this._emailTemplate
          .getTemplate((<any>data).templateKey, data.data)
          .toString();
        if (template.includes('supported')) {
          template = this.template(data);
        }

        const mailOptions = {
          from: {
            address: String(this.configService.get<string>(ENV.EMAIL_FROM)),
            name: 'Raflink',
          },
          to: data.receiver,
          subject: data.subject,
          html: template,
        };

        await this.transporter.sendMail(mailOptions);

        this.logger.log('Email sent');
        return true;
      } catch (error) {
        this.logger.error('Error sending email');
        this.logger.error(error);
        return false;
      }
    } else {
      this.logger.log('Email sending disabled in DEV ENVIRONMENT');
      return false;
    }
  }
}
