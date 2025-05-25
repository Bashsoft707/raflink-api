import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import {
  DomainCheckResult,
  DomainSuggestion,
} from '../../authentication/interface';
import axios from 'axios';
import { StripeService } from '../../stripe/service/stripe.service';
import { Types } from 'mongoose';
import { PurchaseDomainDto } from '../../authentication/dtos';
import { TransactionService } from '../../transaction/services/transaction.service';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { TransactionStatus } from 'src/constants';
import { ResellerClubProxyService } from 'src/utils/services/resellerclub-proxy.service';

@Injectable()
export class DomainService {
  private readonly API_KEY = process.env.RESELLER_CLUB_API_KEY;
  private readonly AUTH_USERID = process.env.RESELLER_CLUB_AUTH_USERID;
  private readonly BASE_URL = 'https://httpapi.com/api';
  private readonly SANDBOX_URL = 'https://test.httpapi.com/api';
  private readonly USE_SANDBOX = process.env.NODE_ENV !== 'production';

  constructor(
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(StripeService)
    private readonly stripeService: StripeService,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
    @Inject(ResellerClubProxyService)
    private readonly resellerClubProxy: ResellerClubProxyService,
  ) {}

  async domainAvailability(domainName: string) {
    try {
      if (!domainName || !this.isValidDomainFormat(domainName)) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid domain format',
          data: null,
          error: 'Please enter a valid domain name',
        };
      }

      const domainCheckResult = await this.checkDomainAvailability(domainName);

      if (domainCheckResult.isAvailable) {
        return {
          status: 'success',
          statusCode: HttpStatus.OK,
          message: 'Domain is available',
          data: {
            domain: domainName,
            price: domainCheckResult.price,
          },
          error: null,
        };
      } else {
        const suggestions = await this.generateDomainSuggestions(domainName);

        return {
          status: 'fail',
          statusCode: HttpStatus.OK,
          message: 'Domain is not available',
          data: {
            suggestions: suggestions,
            originalDomain: domainName,
          },
          error: null,
        };
      }
    } catch (error) {
      console.error('Domain availability check error:', error);
      return {
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to check domain availability',
        data: null,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  private async checkDomainAvailability(
    domainName: string,
  ): Promise<DomainCheckResult> {
    try {
      const [sld, ...tldParts] = domainName.split('.');
      const tld = tldParts.join('.');

      const response = await this.resellerClubProxy.makeRequest(
        'domains/available.json',
        {
          'auth-userid': this.AUTH_USERID,
          'api-key': this.API_KEY,
          'domain-name': sld,
          tlds: tld,
        },
      );

      console.log('response', response);

      console.log('ResellerClub API Response:', response.data);

      const domainKey = `${sld}.${tld}`;
      const result = response.data[domainKey];

      if (!result) {
        throw new Error(`No result found for domain ${domainKey}`);
      }

      const isAvailable = result.status === 'available';
      let price: any = null;

      if (isAvailable) {
        try {
          price = await this.fetchDomainPrice(tld);
        } catch (priceError) {
          console.warn('Could not fetch price:', priceError.message);
          price = this.getDefaultPriceForTld(tld);
        }
      }

      return {
        domain: domainKey,
        isAvailable,
        price,
      };
    } catch (error) {
      console.error(`Error checking availability for ${domainName}:`, error);
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            throw new Error(
              `Bad Request: ${data.message || 'Invalid parameters'}`,
            );
          case 401:
            throw new Error(
              'Authentication failed. Check your API credentials.',
            );
          case 403:
            throw new Error('Access forbidden. Check your API permissions.');
          case 429:
            throw new Error('Rate limit exceeded. Please try again later.');
          case 500:
            throw new Error(
              'ResellerClub API server error. Please try again later.',
            );
          default:
            throw new Error(
              `API error (${status}): ${data.message || 'Unknown error'}`,
            );
        }
      }

      throw new Error(`Domain availability check failed: ${error.message}`);
    }
  }

  private async fetchDomainPrice(tld: string): Promise<number> {
    try {
      const response = await this.resellerClubProxy.makeRequest(
        'domains/reseller-price.json',
        {
          'auth-userid': this.AUTH_USERID,
          'api-key': this.API_KEY,
          tld: tld,
        },
      );

      const priceData = response.data;

      console.log('rpice data', priceData);

      if (priceData && priceData[tld]) {
        const tldPrice = priceData[tld];
        // Usually returns registration price for 1 year
        return parseFloat(tldPrice.registration || tldPrice.addtransfer || 0);
      }

      return this.getDefaultPriceForTld(tld);
    } catch (error) {
      console.error(`Error fetching price for ${tld}:`, error);
      return this.getDefaultPriceForTld(tld);
    }
  }

  private getDefaultPriceForTld(tld: string): number {
    const prices: Record<string, number> = {
      com: 12.99,
      net: 12.99,
      org: 12.99,
      info: 14.99,
      biz: 14.99,
      co: 25.99,
      io: 39.99,
      me: 19.99,
      cc: 24.99,
      tv: 34.99,
    };

    return prices[tld] || 14.99;
  }

  private async generateDomainSuggestions(
    domainName: string,
  ): Promise<DomainSuggestion[]> {
    try {
      const [baseName] = domainName.split('.');
      const popularTlds = ['com', 'net', 'org', 'info', 'biz', 'co', 'io'];
      const suggestions: DomainSuggestion[] = [];

      const checkPromises = popularTlds.map(async (tld) => {
        try {
          const checkResult = await this.checkDomainAvailability(
            `${baseName}.${tld}`,
          );
          if (checkResult.isAvailable) {
            return {
              domain: checkResult.domain,
              isAvailable: true,
              price: checkResult.price,
              tld,
            };
          }
        } catch (error) {
          console.warn(`Failed to check ${baseName}.${tld}:`, error.message);
        }
        return null;
      });

      const results = await Promise.allSettled(checkPromises);

      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          suggestions.push(result.value);
        }
      }

      if (suggestions.length < 5) {
        const variations = this.generateDomainVariations(baseName);
        const variationPromises = variations
          .slice(0, 10 - suggestions.length)
          .map(async (variation) => {
            try {
              const checkResult = await this.checkDomainAvailability(variation);
              if (checkResult.isAvailable) {
                return {
                  domain: checkResult.domain,
                  isAvailable: true,
                  price: checkResult.price,
                  tld: variation.split('.').pop(),
                };
              }
            } catch (error) {
              console.warn(
                `Failed to check variation ${variation}:`,
                error.message,
              );
            }
            return null;
          });

        const variationResults = await Promise.allSettled(variationPromises);

        for (const result of variationResults) {
          if (result.status === 'fulfilled' && result.value) {
            suggestions.push(result.value);
          }
        }
      }

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error generating domain suggestions:', error);
      return this.generateBasicSuggestions(domainName);
    }
  }

  private generateDomainVariations(baseName: string): string[] {
    const prefixes = ['get', 'my', 'the', 'use', 'try'];
    const suffixes = ['app', 'hq', 'pro', 'hub', 'site'];
    const variations: string[] = [];

    prefixes.forEach((prefix) => {
      variations.push(`${prefix}${baseName}.com`);
    });

    suffixes.forEach((suffix) => {
      variations.push(`${baseName}${suffix}.com`);
    });

    return variations;
  }

  private generateBasicSuggestions(domainName: string): DomainSuggestion[] {
    const [baseName] = domainName.split('.');
    const tlds = ['com', 'net', 'org', 'io', 'co'];

    return tlds.map((tld) => ({
      domain: `${baseName}.${tld}`,
      isAvailable: true,
      price: this.getDefaultPriceForTld(tld),
      tld,
    }));
  }

  async createDomainPurchaseSession(
    domainName: string,
    years: number,
    userData: any,
    userId: Types.ObjectId,
  ) {
    try {
      const availabilityCheck = await this.checkDomainAvailability(domainName);

      if (!availabilityCheck.isAvailable) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Domain is no longer available',
          data: null,
          error: 'This domain has been registered by someone else',
        };
      }

      const purchaseSession = await this.createPurchaseSession(
        domainName,
        years,
        userData,
        userId,
        availabilityCheck.price,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Domain purchase session created',
        data: {
          purchaseUrl: purchaseSession.purchaseUrl,
          sessionId: purchaseSession.sessionId,
          expiresAt: purchaseSession.expiresAt,
          paymentId: purchaseSession.paymentIntentId,
        },
        error: null,
      };
    } catch (error) {
      console.error('Domain purchase session error:', error);
      return {
        status: 'error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create domain purchase session',
        data: null,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  private async createPurchaseSession(
    domainName: string,
    years: number,
    userData: any,
    userId: Types.ObjectId,
    price?: number | undefined,
  ) {
    try {
      const domainPrice = price || 12.99;
      const totalAmount = Math.round(domainPrice * years * 100);

      const paymentIntent = await this.stripeService.purchaseDomain(
        domainName,
        years,
        totalAmount,
        String(userId),
      );

      // Save pending order in database
      const sessionId = this.generateSessionId();
      // await this.savePendingOrder(
      //   sessionId,
      //   domainName,
      //   years,
      //   userData,
      //   paymentIntent.id,
      //   totalAmount,
      // );

      return {
        purchaseUrl: `/domain-checkout/${sessionId}`,
        sessionId: sessionId,
        paymentIntentId: paymentIntent.id,
        paymentClientSecret: paymentIntent.client_secret,
        amount: totalAmount / 100,
        domain: domainName,
        years: years,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      };
    } catch (error) {
      console.error(
        `Error creating purchase session for ${domainName}:`,
        error,
      );
      throw new Error(`Purchase session creation failed: ${error.message}`);
    }
  }

  async purchaseDomain(
    domainName: string,
    userId: Types.ObjectId,
    userDetails: PurchaseDomainDto,
  ) {
    try {
      const paymentVerified = await this.stripeService.verifyStripePayment(
        userDetails.paymentId,
        domainName,
      );

      if (!paymentVerified) {
        return {
          status: 'fail',
          message: 'Payment verification failed',
          data: null,
          error: 'Could not verify payment was successful',
        };
      }

      const availabilityCheck = await this.checkDomainAvailability(domainName);
      if (!availabilityCheck.isAvailable) {
        return {
          status: 'fail',
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Domain is no longer available',
          data: null,
          error: 'This domain has been registered by someone else',
        };
      }

      const apiUrl = this.USE_SANDBOX ? this.SANDBOX_URL : this.BASE_URL;

      const response = await axios.post(
        `${apiUrl}/domains/register.json`,
        null,
        {
          params: {
            'auth-userid': this.AUTH_USERID,
            'api-key': this.API_KEY,
            'domain-name': domainName,
            years: 1,
            ns1: 'dns1.registrar-servers.com',
            ns2: 'dns2.registrar-servers.com',
            // Customer details
            'customer-id': await this.getOrCreateCustomerId(userDetails),
            // Contact details
            'reg-contact-id': await this.getOrCreateContactId(
              userDetails,
              'registrant',
            ),
            'admin-contact-id': await this.getOrCreateContactId(
              userDetails,
              'admin',
            ),
            'tech-contact-id': await this.getOrCreateContactId(
              userDetails,
              'tech',
            ),
            'billing-contact-id': await this.getOrCreateContactId(
              userDetails,
              'billing',
            ),
            // Privacy protection
            'protect-privacy': 'true',
          },
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 60000,
        },
      );

      console.log('Domain registration response:', response.data);

      if (response.data && response.data.entityid) {
        // Registration successful
        await this.recordDomainPurchase(
          domainName,
          userDetails,
          response.data.entityid,
          response.data.sellingcurrencyamount || availabilityCheck.price,
          userId,
        );

        return {
          status: 'success',
          message: 'Domain purchased successfully',
          data: {
            domain: domainName,
            domainId: response.data.entityid,
            registrationDate: new Date(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          error: null,
        };
      } else {
        const errorMsg = response.data?.error || 'Domain registration failed';
        return {
          status: 'fail',
          message: 'Domain purchase failed',
          data: null,
          error: errorMsg,
        };
      }
    } catch (error) {
      console.error('Error purchasing domain:', error);

      let errorMessage = 'An unexpected error occurred';

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            errorMessage = `Registration failed: ${data.error || 'Invalid request'}`;
            break;
          case 401:
            errorMessage = 'Authentication failed during registration';
            break;
          case 403:
            errorMessage = 'Access forbidden during registration';
            break;
          case 500:
            errorMessage = 'ResellerClub server error during registration';
            break;
          default:
            errorMessage = `Registration error (${status}): ${data.error || 'Unknown error'}`;
        }
      }

      return {
        status: 'fail',
        message: 'Error purchasing domain',
        data: null,
        error: errorMessage,
      };
    }
  }

  private async getOrCreateCustomerId(
    userDetails: PurchaseDomainDto,
  ): Promise<string> {
    try {
      const apiUrl = this.USE_SANDBOX ? this.SANDBOX_URL : this.BASE_URL;

      const response = await axios.post(
        `${apiUrl}/customers/signup.json`,
        null,
        {
          params: {
            'auth-userid': this.AUTH_USERID,
            'api-key': this.API_KEY,
            username: userDetails.email,
            passwd: this.generateRandomPassword(),
            name: `${userDetails.firstName} ${userDetails.lastName}`,
            company: userDetails.company || 'Individual',
            'address-line-1': userDetails.address1,
            city: userDetails.city,
            state: userDetails.state,
            zipcode: userDetails.zip,
            country: userDetails.country,
            'phone-cc': this.getCountryCode(userDetails.country),
            phone: userDetails.phone,
            'lang-pref': 'en',
          },
        },
      );

      return response.data.customerid || response.data.result;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw new Error('Failed to create customer account');
    }
  }

  private async getOrCreateContactId(
    userDetails: PurchaseDomainDto,
    type: string,
  ): Promise<string> {
    try {
      const apiUrl = this.USE_SANDBOX ? this.SANDBOX_URL : this.BASE_URL;

      const response = await axios.post(`${apiUrl}/contacts/add.json`, null, {
        params: {
          'auth-userid': this.AUTH_USERID,
          'api-key': this.API_KEY,
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          company: userDetails.company || 'Individual',
          email: userDetails.email,
          'address-line-1': userDetails.address1,
          city: userDetails.city,
          state: userDetails.state,
          zipcode: userDetails.zip,
          country: userDetails.country,
          'phone-cc': this.getCountryCode(userDetails.country),
          phone: userDetails.phone,
          'customer-id': await this.getOrCreateCustomerId(userDetails),
          type: 'Contact',
        },
      });

      return response.data.contactid || response.data.result;
    } catch (error) {
      console.error(`Error creating ${type} contact:`, error);
      throw new Error(`Failed to create ${type} contact`);
    }
  }

  private async recordDomainPurchase(
    domainName: string,
    userDetails: any,
    domainId: string,
    amount: number,
    userId: Types.ObjectId,
  ): Promise<void> {
    console.log('Recording domain purchase:', {
      domainName,
      userDetails,
      domainId,
      amount,
      purchaseDate: new Date(),
    });

    const { cardType, last4 } =
      await this.stripeService.getPaymentMethodDetails(
        userDetails.paymentIntentId,
      );

    // const invoice = subscription.latest_invoice as Stripe.Invoice;

    // const invoiceUrl = invoice.hosted_invoice_url;
    // const receiptPdf = invoice.invoice_pdf;

    const transactionPayload = {
      userId,
      amount,
      description: 'Payment for domain purchase',
      transactionType: 'domain',
      currency: 'usd',
      transactionRef: randomUUID(),
      cardType,
      cardLastFourDigit: last4,
      transactionDate: new Date(),
      status: TransactionStatus.SUCCESS,
      // invoiceUrl,
      // receiptPdf,
    };

    await this.transactionService.createTransaction(transactionPayload);
  }

  private generateRandomPassword(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  private getCountryCode(country: string): string {
    const codes: Record<string, string> = {
      US: '1',
      UK: '44',
      CA: '1',
      AU: '61',
      DE: '49',
      FR: '33',
      IN: '91',
    };
    return codes[country] || '1';
  }

  private isValidDomainFormat(domain: string): boolean {
    const domainRegex =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  private generateSessionId(): string {
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }
}

// import { HttpStatus, Inject, Injectable } from '@nestjs/common';
// import { EmailService } from '../../email/email.service';
// import {
//   DomainCheckResult,
//   DomainSuggestion,
// } from '../../authentication/interface';
// import axios from 'axios';
// import { DOMParser } from 'xmldom';
// import { StripeService } from '../../stripe/service/stripe.service';
// import { Types } from 'mongoose';
// import { PurchaseDomainDto } from '../../authentication/dtos';
// import { TransactionService } from '../../transaction/services/transaction.service';
// import Stripe from 'stripe';
// import { randomUUID } from 'crypto';
// import { TransactionStatus } from 'src/constants';

// @Injectable()
// export class DomainService {
//   API_KEY = process.env.RESELLER_CLUB_API_KEY || 'test';
//   API_URL =
//     process.env.RESELLER_CLUB_URL || 'https://api.domain.com.au/v1/domains';
//   CLIENT_IP = process.env.CLIENT_IP || '102.109';
//   API_USER = process.env.API_USER || 'user';
//   RESELLER_ID = process.env.RESELLER_CLUB_PRO_ID || 'reseller-id';

//   constructor(
//     @Inject(EmailService)
//     private readonly emailService: EmailService,
//     @Inject(StripeService)
//     private readonly stripeService: StripeService,
//     @Inject(TransactionService)
//     private readonly transactionService: TransactionService,
//   ) {}

//   async domainAvailability(domainName: string) {
//     try {
//       if (!domainName || !this.isValidDomainFormat(domainName)) {
//         return {
//           status: 'fail',
//           statusCode: HttpStatus.BAD_REQUEST,
//           message: 'Invalid domain format',
//           data: null,
//           error: 'Please enter a valid domain name',
//         };
//       }

//       const domainCheckResult = await this.checkDomainAvailability(domainName);

//       if (domainCheckResult.isAvailable) {
//         return {
//           status: 'success',
//           statusCode: HttpStatus.OK,
//           message: 'Domain is available',
//           data: {
//             domain: domainName,
//             price: domainCheckResult.price,
//           },
//           error: null,
//         };
//       } else {
//         // const suggestions = await this.generateDomainSuggestions(domainName);

//         return {
//           status: 'fail',
//           statusCode: HttpStatus.OK,
//           message: 'Domain is not available',
//           data: {
//             // suggestions: suggestions,
//             originalDomain: domainName,
//           },
//           error: null,
//         };
//       }
//     } catch (error) {
//       console.error('Domain availability check error:', error);
//       return {
//         status: 'error',
//         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: 'Failed to check domain availability',
//         data: null,
//         error: error.message || 'An unexpected error occurred',
//       };
//     }
//   }

//   async createDomainPurchaseSession(
//     domainName: string,
//     years: number,
//     userData: any,
//     userId: Types.ObjectId,
//   ) {
//     try {
//       const availabilityCheck = await this.checkDomainAvailability(domainName);

//       if (!availabilityCheck.isAvailable) {
//         return {
//           status: 'fail',
//           statusCode: HttpStatus.BAD_REQUEST,
//           message: 'Domain is no longer available',
//           data: null,
//           error: 'This domain has been registered by someone else',
//         };
//       }

//       const purchaseSession = await this.createNamecheapPurchaseSession(
//         domainName,
//         years,
//         userData,
//         userId,
//       );

//       return {
//         status: 'success',
//         statusCode: HttpStatus.CREATED,
//         message: 'Domain purchase session created',
//         data: {
//           purchaseUrl: purchaseSession.purchaseUrl,
//           sessionId: purchaseSession.sessionId,
//           expiresAt: purchaseSession.expiresAt,
//           paymentId: purchaseSession.paymentIntentId,
//         },
//         error: null,
//       };
//     } catch (error) {
//       console.error('Domain purchase session error:', error);
//       return {
//         status: 'error',
//         statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
//         message: 'Failed to create domain purchase session',
//         data: null,
//         error: error.message || 'An unexpected error occurred',
//       };
//     }
//   }

//   private async checkDomainAvailability(
//     domainName: string,
//   ): Promise<DomainCheckResult> {
//     try {
//       const [sld, ...tldParts] = domainName.split('.');
//       const tld = tldParts.join('.');

//       console.log('credentials', this.API_URL, this.RESELLER_ID, this.API_KEY);

//       const response = await axios.get(
//         `https://domaincheck.httpapi.com/api/domains/available.json`,
//         {
//           params: {
//             'auth-userid': this.RESELLER_ID,
//             'api-key': this.API_KEY,
//             'domain-name': sld,
//             tlds: tld,
//           },
//           headers: {
//             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
//             Accept: 'application/json',
//             'Accept-Language': 'en-US,en;q=0.9',
//           },
//         },
//       );

//       console.log('response', response);

//       // const response = await axios.get(
//       //   `${process.env.WHO_IS_API_URL}?apiKey=${process.env.WHO_IS_API_KEY}&domainName=${domainName}`,
//       // );

//       // const { data } = response;

//       const result = response.data[`${sld}.${tld}`];
//       const isAvailable = result.status === 'available';

//       // const isAvailable = data.DomainInfo.domainAvailability === 'AVAILABLE';

//       return {
//         domain: `${sld}.${tld}`,
//         isAvailable,
//         // price: (await this.fetchDomainPrice(tld)) as any,
//       };
//     } catch (error) {
//       console.error(`Error checking availability for ${domainName}:`, error);
//       throw new Error(`Domain availability check failed: ${error.message}`);
//     }
//   }

//   // private async fetchDomainPrice(tld: string) {
//   //   try {
//   //     console.log('credentials', this.API_URL, this.RESELLER_ID, this.API_KEY);

//   //     const response = await axios.get(
//   //       `https://api.tldspy.com/api/v1/prices/cheapest`,
//   //       {
//   //         params: {
//   //           tlds: tld,
//   //           limit: 3,
//   //         },
//   //         headers: {
//   //           'X-API-KEY':
//   //             '3457724c099405bc3ecb20b87d9b8fc0375825530b1292636c72056739251cf9',
//   //           Accept: 'application/json',
//   //           Connection: 'keep-alive',
//   //         },
//   //       },
//   //     );

//   //     return {
//   //       tld,
//   //       price: response.data?.results,
//   //     };
//   //   } catch (error) {
//   //     console.error(`Error checking domain price for ${tld}:`, error);
//   //     throw new Error(`Domain price check failed: ${error.message}`);
//   //   }
//   // }

//   private async generateDomainSuggestions(
//     domainName: string,
//   ): Promise<DomainSuggestion[]> {
//     try {
//       const parts = domainName.split('.');
//       const baseName = parts[0];
//       const originalTld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

//       const params = new URLSearchParams({
//         ApiUser: this.API_USER,
//         ApiKey: this.API_KEY,
//         UserName: this.API_USER,
//         ClientIp: this.CLIENT_IP,
//         Command: 'namecheap.domains.check',
//         DomainList: [
//           // Check original domain with different TLDs
//           `${baseName}.com`,
//           `${baseName}.net`,
//           `${baseName}.org`,
//           `${baseName}.io`,
//           `${baseName}.co`,
//           // Check with variations
//           `${baseName}app.com`,
//           `${baseName}hq.com`,
//           `get${baseName}.com`,
//           `my${baseName}.com`,
//           `the${baseName}.com`,
//           // Add more creative variations
//           `${baseName}hub.com`,
//           `use${baseName}.com`,
//           `${baseName}pro.com`,
//           `${baseName}now.com`,
//           `try${baseName}.com`,
//         ].join(','),
//       });

//       const response = await axios.get(`${this.API_URL}?${params.toString()}`);

//       // Log first line of response only to avoid excessive logging
//       console.log(
//         'domain check',
//         typeof response.data === 'string'
//           ? response.data.split('\n')[0]
//           : response.data,
//       );

//       const suggestions = this.parseNamecheapDomainsCheckResponse(
//         response.data,
//       );

//       if (suggestions.length < 5) {
//         const additionalSuggestions = await this.generateAdditionalSuggestions(
//           baseName,
//           originalTld,
//         );
//         return [...suggestions, ...additionalSuggestions].slice(0, 5);
//       }

//       return suggestions.slice(0, 5);
//     } catch (error) {
//       console.error('Error generating domain suggestions:', error);

//       return this.generateBasicSuggestions(domainName);
//     }
//   }

//   private parseNamecheapDomainsCheckResponse(
//     responseData: string,
//   ): DomainSuggestion[] {
//     try {
//       const suggestions: DomainSuggestion[] = [];

//       const domainCheckResults =
//         responseData.match(/<DomainCheckResult[^>]*>/g) || [];

//       domainCheckResults.forEach((result: any) => {
//         const domainMatch = result.match(/Domain="([^"]+)"/);
//         const availableMatch = result.match(/Available="([^"]+)"/);

//         if (domainMatch && availableMatch) {
//           const domain = domainMatch[1];
//           const available = availableMatch[1].toLowerCase() === 'true';

//           if (available) {
//             const tld = domain.split('.').pop() || 'com';

//             suggestions.push({
//               domain,
//               isAvailable: true,
//               price: this.getPriceForTld(tld),
//             });
//           }
//         }
//       });

//       return suggestions;
//     } catch (error) {
//       console.error('Error parsing domain check response:', error);
//       return [];
//     }
//   }

//   private generateBasicSuggestions(domainName: string): DomainSuggestion[] {
//     const parts = domainName.split('.');
//     const baseName = parts[0];
//     const tlds = ['com', 'net', 'org', 'io', 'co'];
//     const prefixes = ['get', 'my', 'the'];
//     const suffixes = ['app', 'hq', 'pro', 'hub'];

//     const suggestions: DomainSuggestion[] = [];

//     for (const tld of tlds) {
//       if (suggestions.length >= 5) break;

//       const domain = `${baseName}.${tld}`;
//       if (domain !== domainName) {
//         suggestions.push({
//           domain,
//           isAvailable: true,
//           price: this.getPriceForTld(tld),
//         });
//       }
//     }

//     for (const prefix of prefixes) {
//       if (suggestions.length >= 5) break;

//       suggestions.push({
//         domain: `${prefix}${baseName}.com`,
//         isAvailable: true,
//         price: this.getPriceForTld('com'),
//       });
//     }

//     for (const suffix of suffixes) {
//       if (suggestions.length >= 5) break;

//       suggestions.push({
//         domain: `${baseName}${suffix}.com`,
//         isAvailable: true,
//         price: this.getPriceForTld('com'),
//       });
//     }

//     return suggestions.slice(0, 5);
//   }

//   private getPriceForTld(tld: string): number {
//     const prices: Record<string, number> = {
//       com: 10.99,
//       net: 12.99,
//       org: 12.99,
//       io: 39.99,
//       co: 25.99,
//     };

//     return prices[tld] || 14.99;
//   }

//   private async generateAdditionalSuggestions(
//     baseName: string,
//     originalTld: string,
//   ): Promise<DomainSuggestion[]> {
//     const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app'].filter(
//       (tld) => tld !== originalTld,
//     );

//     const prefixes = ['my', 'the', 'get', 'try', 'use'];
//     const suffixes = ['app', 'site', 'online', 'web', 'hq'];

//     const suggestions: DomainSuggestion[] = [];
//     const checkPromises: Promise<DomainCheckResult>[] = [];

//     for (const tld of popularTlds.slice(0, 3)) {
//       checkPromises.push(this.checkDomainAvailability(`${baseName}.${tld}`));
//     }

//     for (const prefix of prefixes.slice(0, 2)) {
//       checkPromises.push(
//         this.checkDomainAvailability(`${prefix}${baseName}.${originalTld}`),
//       );
//     }

//     for (const suffix of suffixes.slice(0, 2)) {
//       checkPromises.push(
//         this.checkDomainAvailability(`${baseName}${suffix}.${originalTld}`),
//       );
//     }

//     const results = await Promise.allSettled(checkPromises);

//     for (const result of results) {
//       if (result.status === 'fulfilled' && result.value.isAvailable) {
//         const domain = result.value.domain;
//         const [sld, ...tldParts] = domain.split('.');
//         suggestions.push({
//           domain: domain,
//           isAvailable: true,
//           price: result.value.price,
//           tld: tldParts.join('.'),
//         });
//       }
//     }

//     return suggestions;
//   }

//   async purchaseDomain(
//     domainName: string,
//     userId: Types.ObjectId,
//     userDetails: PurchaseDomainDto,
//   ) {
//     try {
//       const paymentVerified = await this.stripeService.verifyStripePayment(
//         userDetails.paymentId,
//         domainName,
//       );

//       if (!paymentVerified) {
//         return {
//           status: 'fail',
//           message: 'Payment verification failed',
//           data: null,
//           error: 'Could not verify payment was successful',
//         };
//       }

//       const response = await axios.get(this.API_URL, {
//         params: {
//           ApiUser: this.API_USER,
//           ApiKey: this.API_KEY,
//           UserName: this.API_USER,
//           ClientIp: this.CLIENT_IP,
//           Command: 'namecheap.domains.create',
//           DomainName: domainName,
//           Years: 1, // Default to 1 year
//           RegistrantFirstName: userDetails.firstName,
//           RegistrantLastName: userDetails.lastName,
//           RegistrantAddress1: userDetails.address1,
//           RegistrantCity: userDetails.city,
//           RegistrantStateProvince: userDetails.state,
//           RegistrantPostalCode: userDetails.zip,
//           RegistrantCountry: userDetails.country,
//           RegistrantEmailAddress: userDetails.email,
//           RegistrantPhone: userDetails.phone,
//           // Set technical contact details (required)
//           TechFirstName: userDetails.firstName,
//           TechLastName: userDetails.lastName,
//           TechAddress1: userDetails.address1,
//           TechCity: userDetails.city,
//           TechStateProvince: userDetails.state,
//           TechPostalCode: userDetails.zip,
//           TechCountry: userDetails.country,
//           TechEmailAddress: userDetails.email,
//           TechPhone: userDetails.phone,
//           // Admin contact details
//           AdminFirstName: userDetails.firstName,
//           AdminLastName: userDetails.lastName,
//           AdminAddress1: userDetails.address1,
//           AdminCity: userDetails.city,
//           AdminStateProvince: userDetails.state,
//           AdminPostalCode: userDetails.zip,
//           AdminCountry: userDetails.country,
//           AdminEmailAddress: userDetails.email,
//           AdminPhone: userDetails.phone,
//           AuxBillingFirstName: userDetails.firstName,
//           AuxBillingLastName: userDetails.lastName,
//           AuxBillingAddress1: userDetails.address1,
//           AuxBillingCity: userDetails.city,
//           AuxBillingStateProvince: userDetails.state,
//           AuxBillingPostalCode: userDetails.zip,
//           AuxBillingCountry: userDetails.country,
//           AuxBillingEmailAddress: userDetails.email,
//           AuxBillingPhone: userDetails.phone,
//           // Enable free WHOIS guard
//           AddFreeWhoisguard: 'yes',
//           WGEnabled: 'yes',
//         },
//       });

//       const parser = new DOMParser();
//       const xmlDoc = parser.parseFromString(response.data, 'text/xml');

//       const domainCreateResult =
//         xmlDoc.getElementsByTagName('DomainCreateResult')[0];
//       const registrationStatus =
//         domainCreateResult?.getAttribute('Registered') === 'true';
//       const domainID = domainCreateResult?.getAttribute('DomainID');
//       const amount = domainCreateResult?.getAttribute('ChargedAmount');

//       if (registrationStatus && domainID) {
//         await this.recordDomainPurchase(
//           domainName,
//           userDetails,
//           domainID,
//           amount,
//           userId,
//         );

//         return {
//           status: 'success',
//           message: 'Domain purchased successfully',
//           data: {
//             domain: domainName,
//             domainId: domainID,
//             registrationDate: new Date(),
//             expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
//           },
//           error: null,
//         };
//       } else {
//         const errorMsg =
//           domainCreateResult?.getElementsByTagName('Errors')[0]?.textContent ||
//           'Unknown error';

//         return {
//           status: 'fail',
//           message: 'Domain purchase failed',
//           data: null,
//           error: errorMsg,
//         };
//       }
//     } catch (error) {
//       console.error('Error purchasing domain:', error);
//       return {
//         status: 'fail',
//         message: 'Error purchasing domain',
//         data: null,
//         error: error.message || 'An unexpected error occurred',
//       };
//     }
//   }

//   private async createNamecheapPurchaseSession(
//     domainName: string,
//     years: number,
//     userData: any,
//     userId: Types.ObjectId,
//   ) {
//     try {
//       const domainInfo = await this.checkDomainAvailability(domainName);

//       if (!domainInfo.isAvailable) {
//         throw new Error('Domain is no longer available');
//       }

//       const domainPrice = domainInfo.price || 12.99;
//       const totalAmount = Math.round(domainPrice * years * 100);

//       const paymentIntent = await this.stripeService.purchaseDomain(
//         domainName,
//         years,
//         totalAmount,
//         String(userId),
//       );

//       // Save pending order in database
//       const sessionId = this.generateSessionId();
//       await this.savePendingOrder(
//         sessionId,
//         domainName,
//         years,
//         userData,
//         paymentIntent.id,
//         totalAmount,
//       );

//       return {
//         purchaseUrl: `/domain-checkout/${sessionId}`,
//         sessionId: sessionId,
//         paymentIntentId: paymentIntent.id,
//         paymentClientSecret: paymentIntent.client_secret,
//         amount: totalAmount / 100,
//         domain: domainName,
//         years: years,
//         expiresAt: new Date(Date.now() + 30 * 60 * 1000),
//       };
//     } catch (error) {
//       console.error(
//         `Error creating purchase session for ${domainName}:`,
//         error,
//       );
//       throw new Error(`Purchase session creation failed: ${error.message}`);
//     }
//   }

//   private parseNamecheapAvailabilityResponse(responseData: any): boolean {
//     try {
//       if (typeof responseData === 'string') {
//         const parser = new DOMParser();
//         const xmlDoc = parser.parseFromString(responseData, 'text/xml');

//         const domainCheckResult =
//           xmlDoc.getElementsByTagName('DomainCheckResult')[0];
//         return domainCheckResult?.getAttribute('Available') === 'true';
//       } else if (typeof responseData === 'object') {
//         return (
//           responseData.CommandResponse?.DomainCheckResult?.Available === 'true'
//         );
//       }

//       return false;
//     } catch (error) {
//       console.error('Error parsing Namecheap availability response:', error);
//       return false;
//     }
//   }

//   private async savePendingOrder(
//     sessionId: string,
//     domainName: string,
//     years: number,
//     userData: any,
//     paymentIntentId: string,
//     amount: number,
//   ): Promise<void> {
//     console.log('Saving pending order:', {
//       sessionId,
//       domainName,
//       years,
//       userData,
//       paymentIntentId,
//       amount,
//       createdAt: new Date(),
//     });

//     // Here you would call your database service to store this information
//   }

//   private async recordDomainPurchase(
//     domainName: string,
//     userDetails: any,
//     domainId: string,
//     amount: number,
//     userId: Types.ObjectId,
//   ): Promise<void> {
//     console.log('Recording domain purchase:', {
//       domainName,
//       userDetails,
//       domainId,
//       amount,
//       purchaseDate: new Date(),
//     });

//     const { cardType, last4 } =
//       await this.stripeService.getPaymentMethodDetails(
//         userDetails.paymentIntentId,
//       );

//     // const invoice = subscription.latest_invoice as Stripe.Invoice;

//     // const invoiceUrl = invoice.hosted_invoice_url;
//     // const receiptPdf = invoice.invoice_pdf;

//     const transactionPayload = {
//       userId,
//       amount,
//       description: 'Payment for domain purchase',
//       transactionType: 'domain',
//       currency: 'usd',
//       transactionRef: randomUUID(),
//       cardType,
//       cardLastFourDigit: last4,
//       transactionDate: new Date(),
//       status: TransactionStatus.SUCCESS,
//       // invoiceUrl,
//       // receiptPdf,
//     };

//     await this.transactionService.createTransaction(transactionPayload);
//   }

//   private parseNamecheapPriceFromResponse(
//     responseData: any,
//   ): number | undefined {
//     try {
//       return parseFloat(
//         responseData.CommandResponse?.DomainCheckResult?.Price || '0',
//       );
//     } catch (error) {
//       console.error('Error parsing Namecheap price:', error);
//       return undefined;
//     }
//   }

//   private isValidDomainFormat(domain: string): boolean {
//     const domainRegex =
//       /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
//     return domainRegex.test(domain);
//   }

//   private generateSessionId(): string {
//     return 'sess_' + Math.random().toString(36).substring(2, 15);
//   }
// }
