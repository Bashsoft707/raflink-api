import { Injectable } from '@nestjs/common';
import { verifyTemplate } from './templates/verify.html';
import { welcomeTemplate } from './templates/welcome.html';
import { onboardingTemplate } from './templates/onboarding.html';
import { TEMPLATES } from '../../constants';
import { otpTemplate } from './templates/otp.html';
import { waitingListTemplate } from './templates/waitinglist.html';
import { accountSetupTemplate } from './templates/accountsetup.html';
import { successfulSubscriptionTemplate } from './templates/successfulSubscription.html';

@Injectable()
export class EmailTemplateLoader {
  verifyTemplate(data: any) {
    const params = {
      code: data.code || 1234,
      raflinkMail: 'contact@raflink.com',
    };

    return this.insertParmasIntoTemplate(verifyTemplate, params);
  }

  welcomeTemplate(data: any) {
    const params = {
      name: data.name,
      raflink_email: data.companyEmail,
    };
    return this.insertParmasIntoTemplate(welcomeTemplate, params);
  }

  otpTemplate(data: any) {
    const params = {
      otp: data.otp,
      raflink_email: data.raflink_email,
      name: data.name,
    };
    return this.insertParmasIntoTemplate(otpTemplate, params);
  }

  accountSetupTemplate(data: any) {
    const params = {
      link: data.link,
      raflink_email: data.raflink_email,
      name: data.name,
      role: data.role,
    };
    return this.insertParmasIntoTemplate(accountSetupTemplate, params);
  }

  waitingListTemplate(data: any) {
    const params = {
      name: data.name,
      raflink_email: data.companyEmail,
    };
    return this.insertParmasIntoTemplate(waitingListTemplate, params);
  }

  onboardingTemplate(data: any) {
    const params = {
      name: data.name,
      raflink_email: data.companyEmail,
      otp: data.otp,
    };
    return this.insertParmasIntoTemplate(onboardingTemplate, params);
  }

  successfulSubscriptionTemplate(data: any) {
    const params = {
      name: data.name,
      raflink_email: data.companyEmail,
      amount: data.amount,
      cardType: data.cardType,
      last4: data.last4,
    };
    return this.insertParmasIntoTemplate(
      successfulSubscriptionTemplate,
      params,
    );
  }

  unsupported() {
    return 'template not supported';
  }

  getTemplate(templateKey: string, data: any): string {
    let template = '';

    switch (templateKey) {
      case TEMPLATES.VERIFY:
        template = this.verifyTemplate(data);
        break;
      case TEMPLATES.WELCOME:
        template = this.welcomeTemplate(data);
        break;
      case TEMPLATES.OTP:
        template = this.otpTemplate(data);
      case TEMPLATES.ONBOARDING:
        template = this.onboardingTemplate(data);
        break;
      case TEMPLATES.WAITLIST:
        template = this.waitingListTemplate(data);
        break;
      case TEMPLATES.ACCOUNTSETUP:
        template = this.accountSetupTemplate(data);
        break;
      case TEMPLATES.SUCCESSFUL_SUBSCRIPTION:
        template = this.successfulSubscriptionTemplate(data);
        break;
      default:
        return this.unsupported();
    }
    return template;
  }

  insertParmasIntoTemplate(template: string, params: any) {
    let i = 0;
    let newTemplateWithParams = '';
    while (i < template.length) {
      const char = template[i];

      if (char == '{') {
        let newKey = '';
        for (let j = i + 1; j < i + 25; j++) {
          const currentKeyChar = template[j];
          if (currentKeyChar != '}') {
            newKey += currentKeyChar;
          } else {
            const keyValue = params[newKey];
            newTemplateWithParams += keyValue;
            i = j;
            break;
          }
        }
      } else {
        newTemplateWithParams += char;
      }
      i++;
    }
    return newTemplateWithParams;
  }
}
