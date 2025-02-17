export interface ISendEmailBody {
  receiver: string;
  subject: string;
  body: string;
  templateKey?: string;
  extras?: object;
  data?: any;
}

export interface IEmailService {
  sendEmail: (data: ISendEmailBody) => Promise<boolean>;
}
