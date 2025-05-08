import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import {
  DomainCheckResult,
  DomainSuggestion,
} from '../../authentication/interface';
import axios from 'axios';
import { DOMParser } from 'xmldom';
import { StripeService } from '../../stripe/service/stripe.service';
import { Types } from 'mongoose';
import { PurchaseDomainDto } from '../../authentication/dtos';
import { TransactionService } from '../../transaction/services/transaction.service';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { TransactionStatus } from 'src/constants';

@Injectable()
export class DomainService {
  API_KEY = process.env.DOMAIN_API_KEY || 'test';
  API_URL =
    process.env.DOMAIN_API_URL || 'https://api.domain.com.au/v1/domains';
  CLIENT_IP = process.env.CLIENT_IP || '102.109';
  API_USER = process.env.API_USER || 'user';

  constructor(
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(StripeService)
    private readonly stripeService: StripeService,
    @Inject(TransactionService)
    private readonly transactionService: TransactionService,
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

      const purchaseSession = await this.createNamecheapPurchaseSession(
        domainName,
        years,
        userData,
        userId,
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

  private async checkDomainAvailability(
    domainName: string,
  ): Promise<DomainCheckResult> {
    try {
      const [sld, ...tldParts] = domainName.split('.');
      const tld = tldParts.join('.');

      const params = new URLSearchParams({
        ApiUser: this.API_USER,
        ApiKey: this.API_KEY,
        UserName: this.API_USER,
        ClientIp: this.CLIENT_IP,
        Command: 'namecheap.domains.check',
        DomainList: domainName,
      });

      const response = await axios.get(`${this.API_URL}?${params.toString()}`);

      const isAvailable = this.parseNamecheapAvailabilityResponse(
        response.data,
      );
      const price = this.parseNamecheapPriceFromResponse(response.data);

      return {
        domain: domainName,
        isAvailable,
        price,
      };
    } catch (error) {
      console.error(`Error checking availability for ${domainName}:`, error);
      throw new Error(`Domain availability check failed: ${error.message}`);
    }
  }

  private async generateDomainSuggestions(
    domainName: string,
  ): Promise<DomainSuggestion[]> {
    try {
      const parts = domainName.split('.');
      const baseName = parts[0];
      const originalTld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

      const params = new URLSearchParams({
        ApiUser: this.API_USER,
        ApiKey: this.API_KEY,
        UserName: this.API_USER,
        ClientIp: this.CLIENT_IP,
        Command: 'namecheap.domains.check',
        DomainList: [
          // Check original domain with different TLDs
          `${baseName}.com`,
          `${baseName}.net`,
          `${baseName}.org`,
          `${baseName}.io`,
          `${baseName}.co`,
          // Check with variations
          `${baseName}app.com`,
          `${baseName}hq.com`,
          `get${baseName}.com`,
          `my${baseName}.com`,
          `the${baseName}.com`,
          // Add more creative variations
          `${baseName}hub.com`,
          `use${baseName}.com`,
          `${baseName}pro.com`,
          `${baseName}now.com`,
          `try${baseName}.com`,
        ].join(','),
      });

      const response = await axios.get(`${this.API_URL}?${params.toString()}`);

      // Log first line of response only to avoid excessive logging
      console.log(
        'domain check',
        typeof response.data === 'string'
          ? response.data.split('\n')[0]
          : response.data,
      );

      const suggestions = this.parseNamecheapDomainsCheckResponse(
        response.data,
      );

      if (suggestions.length < 5) {
        const additionalSuggestions = await this.generateAdditionalSuggestions(
          baseName,
          originalTld,
        );
        return [...suggestions, ...additionalSuggestions].slice(0, 5);
      }

      return suggestions.slice(0, 5);
    } catch (error) {
      console.error('Error generating domain suggestions:', error);

      return this.generateBasicSuggestions(domainName);
    }
  }

  private parseNamecheapDomainsCheckResponse(
    responseData: string,
  ): DomainSuggestion[] {
    try {
      const suggestions: DomainSuggestion[] = [];

      const domainCheckResults =
        responseData.match(/<DomainCheckResult[^>]*>/g) || [];

      domainCheckResults.forEach((result: any) => {
        const domainMatch = result.match(/Domain="([^"]+)"/);
        const availableMatch = result.match(/Available="([^"]+)"/);

        if (domainMatch && availableMatch) {
          const domain = domainMatch[1];
          const available = availableMatch[1].toLowerCase() === 'true';

          if (available) {
            const tld = domain.split('.').pop() || 'com';

            suggestions.push({
              domain,
              isAvailable: true,
              price: this.getPriceForTld(tld),
            });
          }
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error parsing domain check response:', error);
      return [];
    }
  }

  private generateBasicSuggestions(domainName: string): DomainSuggestion[] {
    const parts = domainName.split('.');
    const baseName = parts[0];
    const tlds = ['com', 'net', 'org', 'io', 'co'];
    const prefixes = ['get', 'my', 'the'];
    const suffixes = ['app', 'hq', 'pro', 'hub'];

    const suggestions: DomainSuggestion[] = [];

    for (const tld of tlds) {
      if (suggestions.length >= 5) break;

      const domain = `${baseName}.${tld}`;
      if (domain !== domainName) {
        suggestions.push({
          domain,
          isAvailable: true,
          price: this.getPriceForTld(tld),
        });
      }
    }

    for (const prefix of prefixes) {
      if (suggestions.length >= 5) break;

      suggestions.push({
        domain: `${prefix}${baseName}.com`,
        isAvailable: true,
        price: this.getPriceForTld('com'),
      });
    }

    for (const suffix of suffixes) {
      if (suggestions.length >= 5) break;

      suggestions.push({
        domain: `${baseName}${suffix}.com`,
        isAvailable: true,
        price: this.getPriceForTld('com'),
      });
    }

    return suggestions.slice(0, 5);
  }

  private getPriceForTld(tld: string): number {
    const prices: Record<string, number> = {
      com: 10.99,
      net: 12.99,
      org: 12.99,
      io: 39.99,
      co: 25.99,
    };

    return prices[tld] || 14.99;
  }

  private async generateAdditionalSuggestions(
    baseName: string,
    originalTld: string,
  ): Promise<DomainSuggestion[]> {
    const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app'].filter(
      (tld) => tld !== originalTld,
    );

    const prefixes = ['my', 'the', 'get', 'try', 'use'];
    const suffixes = ['app', 'site', 'online', 'web', 'hq'];

    const suggestions: DomainSuggestion[] = [];
    const checkPromises: Promise<DomainCheckResult>[] = [];

    for (const tld of popularTlds.slice(0, 3)) {
      checkPromises.push(this.checkDomainAvailability(`${baseName}.${tld}`));
    }

    for (const prefix of prefixes.slice(0, 2)) {
      checkPromises.push(
        this.checkDomainAvailability(`${prefix}${baseName}.${originalTld}`),
      );
    }

    for (const suffix of suffixes.slice(0, 2)) {
      checkPromises.push(
        this.checkDomainAvailability(`${baseName}${suffix}.${originalTld}`),
      );
    }

    const results = await Promise.allSettled(checkPromises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value.isAvailable) {
        const domain = result.value.domain;
        const [sld, ...tldParts] = domain.split('.');
        suggestions.push({
          domain: domain,
          isAvailable: true,
          price: result.value.price,
          tld: tldParts.join('.'),
        });
      }
    }

    return suggestions;
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

      const response = await axios.get(this.API_URL, {
        params: {
          ApiUser: this.API_USER,
          ApiKey: this.API_KEY,
          UserName: this.API_USER,
          ClientIp: this.CLIENT_IP,
          Command: 'namecheap.domains.create',
          DomainName: domainName,
          Years: 1, // Default to 1 year
          RegistrantFirstName: userDetails.firstName,
          RegistrantLastName: userDetails.lastName,
          RegistrantAddress1: userDetails.address1,
          RegistrantCity: userDetails.city,
          RegistrantStateProvince: userDetails.state,
          RegistrantPostalCode: userDetails.zip,
          RegistrantCountry: userDetails.country,
          RegistrantEmailAddress: userDetails.email,
          RegistrantPhone: userDetails.phone,
          // Set technical contact details (required)
          TechFirstName: userDetails.firstName,
          TechLastName: userDetails.lastName,
          TechAddress1: userDetails.address1,
          TechCity: userDetails.city,
          TechStateProvince: userDetails.state,
          TechPostalCode: userDetails.zip,
          TechCountry: userDetails.country,
          TechEmailAddress: userDetails.email,
          TechPhone: userDetails.phone,
          // Admin contact details
          AdminFirstName: userDetails.firstName,
          AdminLastName: userDetails.lastName,
          AdminAddress1: userDetails.address1,
          AdminCity: userDetails.city,
          AdminStateProvince: userDetails.state,
          AdminPostalCode: userDetails.zip,
          AdminCountry: userDetails.country,
          AdminEmailAddress: userDetails.email,
          AdminPhone: userDetails.phone,
          AuxBillingFirstName: userDetails.firstName,
          AuxBillingLastName: userDetails.lastName,
          AuxBillingAddress1: userDetails.address1,
          AuxBillingCity: userDetails.city,
          AuxBillingStateProvince: userDetails.state,
          AuxBillingPostalCode: userDetails.zip,
          AuxBillingCountry: userDetails.country,
          AuxBillingEmailAddress: userDetails.email,
          AuxBillingPhone: userDetails.phone,
          // Enable free WHOIS guard
          AddFreeWhoisguard: 'yes',
          WGEnabled: 'yes',
        },
      });

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');

      const domainCreateResult =
        xmlDoc.getElementsByTagName('DomainCreateResult')[0];
      const registrationStatus =
        domainCreateResult?.getAttribute('Registered') === 'true';
      const domainID = domainCreateResult?.getAttribute('DomainID');
      const amount = domainCreateResult?.getAttribute('ChargedAmount');

      if (registrationStatus && domainID) {
        await this.recordDomainPurchase(
          domainName,
          userDetails,
          domainID,
          amount,
          userId,
        );

        return {
          status: 'success',
          message: 'Domain purchased successfully',
          data: {
            domain: domainName,
            domainId: domainID,
            registrationDate: new Date(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          },
          error: null,
        };
      } else {
        const errorMsg =
          domainCreateResult?.getElementsByTagName('Errors')[0]?.textContent ||
          'Unknown error';

        return {
          status: 'fail',
          message: 'Domain purchase failed',
          data: null,
          error: errorMsg,
        };
      }
    } catch (error) {
      console.error('Error purchasing domain:', error);
      return {
        status: 'fail',
        message: 'Error purchasing domain',
        data: null,
        error: error.message || 'An unexpected error occurred',
      };
    }
  }

  private async createNamecheapPurchaseSession(
    domainName: string,
    years: number,
    userData: any,
    userId: Types.ObjectId,
  ) {
    try {
      const domainInfo = await this.checkDomainAvailability(domainName);

      if (!domainInfo.isAvailable) {
        throw new Error('Domain is no longer available');
      }

      const domainPrice = domainInfo.price || 12.99;
      const totalAmount = Math.round(domainPrice * years * 100);

      const paymentIntent = await this.stripeService.purchaseDomain(
        domainName,
        years,
        totalAmount,
        String(userId),
      );

      // Save pending order in database
      const sessionId = this.generateSessionId();
      await this.savePendingOrder(
        sessionId,
        domainName,
        years,
        userData,
        paymentIntent.id,
        totalAmount,
      );

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

  private parseNamecheapAvailabilityResponse(responseData: any): boolean {
    try {
      if (typeof responseData === 'string') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseData, 'text/xml');

        const domainCheckResult =
          xmlDoc.getElementsByTagName('DomainCheckResult')[0];
        return domainCheckResult?.getAttribute('Available') === 'true';
      } else if (typeof responseData === 'object') {
        return (
          responseData.CommandResponse?.DomainCheckResult?.Available === 'true'
        );
      }

      return false;
    } catch (error) {
      console.error('Error parsing Namecheap availability response:', error);
      return false;
    }
  }

  private async savePendingOrder(
    sessionId: string,
    domainName: string,
    years: number,
    userData: any,
    paymentIntentId: string,
    amount: number,
  ): Promise<void> {
    console.log('Saving pending order:', {
      sessionId,
      domainName,
      years,
      userData,
      paymentIntentId,
      amount,
      createdAt: new Date(),
    });

    // Here you would call your database service to store this information
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

  private parseNamecheapPriceFromResponse(
    responseData: any,
  ): number | undefined {
    try {
      return parseFloat(
        responseData.CommandResponse?.DomainCheckResult?.Price || '0',
      );
    } catch (error) {
      console.error('Error parsing Namecheap price:', error);
      return undefined;
    }
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
