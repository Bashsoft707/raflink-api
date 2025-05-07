import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { EmailService } from '../../email/email.service';
import { JwtService } from '@nestjs/jwt';
import EncryptService from '../../../helpers/encryption';
import { DomainCheckResult, DomainSuggestion } from '../interface';
import axios from 'axios';
import { DOMParser } from 'xmldom';

@Injectable()
export class DomainService {
  API_KEY = process.env.DOMAIN_API_KEY || 'test';
  API_URL =
    process.env.DOMAIN_API_URL || 'https://api.domain.com.au/v1/domains';
  CLIENT_IP = process.env.CLIENT_IP || '102.109';
  API_USER = process.env.API_USER || 'user';

  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(EmailService)
    private readonly emailService: EmailService,
    @Inject(EncryptService)
    private readonly encryptionService: EncryptService,
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
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

      // Check domain availability
      const domainCheckResult = await this.checkDomainAvailability(domainName);

      console.log('domain check', domainCheckResult);

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
        // Generate alternative domain suggestions
        const suggestions = await this.generateDomainSuggestions(domainName);

        return {
          status: 'fail',
          statusCode: HttpStatus.OK, // This is an expected result, not an error
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
  ) {
    try {
      // Verify domain is still available before creating purchase session
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

      // Create purchase session with Namecheap
      const purchaseSession = await this.createNamecheapPurchaseSession(
        domainName,
        years,
        userData,
      );

      return {
        status: 'success',
        statusCode: HttpStatus.CREATED,
        message: 'Domain purchase session created',
        data: {
          purchaseUrl: purchaseSession.purchaseUrl,
          sessionId: purchaseSession.sessionId,
          expiresAt: purchaseSession.expiresAt,
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
      // Parse domain to get SLD (second-level domain) and TLD
      const [sld, ...tldParts] = domainName.split('.');
      const tld = tldParts.join('.');

      // Prepare API parameters for Namecheap
      const params = new URLSearchParams({
        ApiUser: this.API_USER,
        ApiKey: this.API_KEY,
        UserName: this.API_USER,
        ClientIp: this.CLIENT_IP,
        Command: 'namecheap.domains.check',
        DomainList: domainName,
      });

      // Make request to Namecheap API
      const response = await axios.get(`${this.API_URL}?${params.toString()}`);

      // Parse XML response
      // Note: In a real implementation, you'd use an XML parser library
      // This is a simplified example assuming JSON response for clarity
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
      // Extract base name without TLD
      const parts = domainName.split('.');
      const baseName = parts[0];
      const originalTld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

      // Prepare API parameters for Namecheap domains check API
      // Using domains.check instead of getNameSuggestions which appears to be invalid
      const params = new URLSearchParams({
        ApiUser: this.API_USER,
        ApiKey: this.API_KEY,
        UserName: this.API_USER,
        ClientIp: this.CLIENT_IP,
        Command: 'namecheap.domains.check', // Changed from getNameSuggestions to check
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

      // Make request to Namecheap domains check API
      const response = await axios.get(`${this.API_URL}?${params.toString()}`);

      // Log first line of response only to avoid excessive logging
      console.log(
        'domain check',
        typeof response.data === 'string'
          ? response.data.split('\n')[0]
          : response.data,
      );

      // Parse response and map to our format
      const suggestions = this.parseNamecheapDomainsCheckResponse(
        response.data,
      );

      console.log('suggestions', suggestions);

      // If Namecheap doesn't return enough suggestions, generate some more
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

      // Fallback to basic suggestions if API fails
      return this.generateBasicSuggestions(domainName);
    }
  }

  // Parse domains.check response
  private parseNamecheapDomainsCheckResponse(
    responseData: string,
  ): DomainSuggestion[] {
    try {
      const suggestions: DomainSuggestion[] = [];

      // Simple XML parsing using regex for this specific format
      // For production code, use a proper XML parser library
      const domainCheckResults =
        responseData.match(/<DomainCheckResult[^>]*>/g) || [];

      domainCheckResults.forEach((result) => {
        // Extract domain name
        const domainMatch = result.match(/Domain="([^"]+)"/);
        // Extract availability
        const availableMatch = result.match(/Available="([^"]+)"/);

        if (domainMatch && availableMatch) {
          const domain = domainMatch[1];
          const available = availableMatch[1].toLowerCase() === 'true';

          if (available) {
            // Extract TLD
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

  // Helper method to generate basic domain suggestions
  private generateBasicSuggestions(domainName: string): DomainSuggestion[] {
    const parts = domainName.split('.');
    const baseName = parts[0];
    const tlds = ['com', 'net', 'org', 'io', 'co'];
    const prefixes = ['get', 'my', 'the'];
    const suffixes = ['app', 'hq', 'pro', 'hub'];

    const suggestions: DomainSuggestion[] = [];

    // Try different TLDs
    for (const tld of tlds) {
      if (suggestions.length >= 5) break;

      const domain = `${baseName}.${tld}`;
      if (domain !== domainName) {
        suggestions.push({
          domain,
          isAvailable: true, // This is optimistic - would need actual checking
          price: this.getPriceForTld(tld),
        });
      }
    }

    // Try prefixes
    for (const prefix of prefixes) {
      if (suggestions.length >= 5) break;

      suggestions.push({
        domain: `${prefix}${baseName}.com`,
        isAvailable: true, // This is optimistic - would need actual checking
        price: this.getPriceForTld('com'),
      });
    }

    // Try suffixes
    for (const suffix of suffixes) {
      if (suggestions.length >= 5) break;

      suggestions.push({
        domain: `${baseName}${suffix}.com`,
        isAvailable: true, // This is optimistic - would need actual checking
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

    return prices[tld] || 14.99; // Default price if TLD not in our list
  }

  // private async generateDomainSuggestions(
  //   domainName: string,
  // ): Promise<DomainSuggestion[]> {
  //   try {
  //     // Extract base name without TLD
  //     const parts = domainName.split('.');
  //     const baseName = parts[0];
  //     const originalTld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

  //     // Prepare API parameters for Namecheap suggestions API
  //     const params = new URLSearchParams({
  //       ApiUser: this.API_USER,
  //       ApiKey: this.API_KEY,
  //       UserName: this.API_USER,
  //       ClientIp: this.CLIENT_IP,
  //       Command: 'namecheap.domains.getNameSuggestions',
  //       SearchTerm: baseName,
  //       OnlyAvailable: 'true',
  //       MaxResults: '10',
  //     });

  //     // Make request to Namecheap suggestions API
  //     const response = await axios.get(`${this.API_URL}?${params.toString()}`);

  //     console.log('response', response);

  //     // Parse response and map to our format
  //     // This is simplified and would need proper XML parsing
  //     const suggestions = this.parseNamecheapSuggestionsResponse(response.data);

  //     console.log('suggestions', suggestions);

  //     // If Namecheap doesn't return enough suggestions, generate some more
  //     if (suggestions.length < 5) {
  //       const additionalSuggestions = await this.generateAdditionalSuggestions(
  //         baseName,
  //         originalTld,
  //       );
  //       return [...suggestions, ...additionalSuggestions].slice(0, 5);
  //     }

  //     return suggestions.slice(0, 5);
  //   } catch (error) {
  //     console.error('Error generating domain suggestions:', error);

  //     // Fallback to basic suggestions if API fails
  //     return this.generateBasicSuggestions(domainName);
  //   }
  // }

  private async generateAdditionalSuggestions(
    baseName: string,
    originalTld: string,
  ): Promise<DomainSuggestion[]> {
    // Common TLDs to try
    const popularTlds = ['com', 'net', 'org', 'io', 'co', 'app'].filter(
      (tld) => tld !== originalTld,
    );

    // Name modifications
    const prefixes = ['my', 'the', 'get', 'try', 'use'];
    const suffixes = ['app', 'site', 'online', 'web', 'hq'];

    const suggestions: DomainSuggestion[] = [];
    const checkPromises: Promise<DomainCheckResult>[] = [];

    // Try different TLDs with original name
    for (const tld of popularTlds.slice(0, 3)) {
      checkPromises.push(this.checkDomainAvailability(`${baseName}.${tld}`));
    }

    // Try some prefixes
    for (const prefix of prefixes.slice(0, 2)) {
      checkPromises.push(
        this.checkDomainAvailability(`${prefix}${baseName}.${originalTld}`),
      );
    }

    // Try some suffixes
    for (const suffix of suffixes.slice(0, 2)) {
      checkPromises.push(
        this.checkDomainAvailability(`${baseName}${suffix}.${originalTld}`),
      );
    }

    // Process all the check results
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

  // private generateBasicSuggestions(domainName: string): DomainSuggestion[] {
  //   const parts = domainName.split('.');
  //   const baseName = parts[0];
  //   const tld = parts.length > 1 ? parts.slice(1).join('.') : 'com';

  //   const altTlds = ['com', 'net', 'org', 'io', 'co'].filter((t) => t !== tld);
  //   const suggestions: DomainSuggestion[] = [];

  //   // Add TLD variations
  //   for (const altTld of altTlds.slice(0, 3)) {
  //     suggestions.push({
  //       domain: `${baseName}.${altTld}`,
  //       isAvailable: true, // Not actually checked in this fallback
  //       tld: altTld,
  //     });
  //   }

  //   // Add prefix/suffix variations
  //   suggestions.push({
  //     domain: `my${baseName}.${tld}`,
  //     isAvailable: true, // Not actually checked in this fallback
  //     tld,
  //   });

  //   suggestions.push({
  //     domain: `${baseName}app.${tld}`,
  //     isAvailable: true, // Not actually checked in this fallback
  //     tld,
  //   });

  //   return suggestions;
  // }

  async purchaseDomain(
    domainName: string,
    userDetails: any,
    paymentIntentId?: string,
  ) {
    try {
      // First, verify payment was successful if a payment intent was provided
      if (paymentIntentId) {
        const paymentVerified = await this.verifyStripePayment(
          paymentIntentId,
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
      }

      // Make the API request to Namecheap to purchase the domain
      const response = await axios.get(this.API_URL, {
        params: {
          ApiUser: this.API_USER,
          ApiKey: this.API_KEY,
          UserName: this.API_USER,
          ClientIp: this.CLIENT_IP,
          Command: 'namecheap.domains.create',
          DomainName: domainName,
          Years: 1, // Default to 1 year
          // Use consistent parameter naming as per the API documentation
          RegistrantFirstName: userDetails.firstName,
          RegistrantLastName: userDetails.lastName,
          RegistrantAddress1: userDetails.address1 || userDetails.address,
          RegistrantCity: userDetails.city,
          RegistrantStateProvince: userDetails.state,
          RegistrantPostalCode: userDetails.zip || userDetails.postalCode,
          RegistrantCountry: userDetails.country,
          RegistrantEmailAddress: userDetails.email,
          RegistrantPhone: userDetails.phone,
          // Set technical contact details (required)
          TechFirstName: userDetails.firstName,
          TechLastName: userDetails.lastName,
          TechAddress1: userDetails.address1 || userDetails.address,
          TechCity: userDetails.city,
          TechStateProvince: userDetails.state,
          TechPostalCode: userDetails.zip || userDetails.postalCode,
          TechCountry: userDetails.country,
          TechEmailAddress: userDetails.email,
          TechPhone: userDetails.phone,
          // Admin contact details
          AdminFirstName: userDetails.firstName,
          AdminLastName: userDetails.lastName,
          AdminAddress1: userDetails.address1 || userDetails.address,
          AdminCity: userDetails.city,
          AdminStateProvince: userDetails.state,
          AdminPostalCode: userDetails.zip || userDetails.postalCode,
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

      // Parse XML response
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, 'text/xml');

      // Extract domain registration result
      const domainCreateResult =
        xmlDoc.getElementsByTagName('DomainCreateResult')[0];
      const registrationStatus =
        domainCreateResult?.getAttribute('Registered') === 'true';
      const domainID = domainCreateResult?.getAttribute('DomainID');

      if (registrationStatus && domainID) {
        // Record successful purchase in database
        await this.recordDomainPurchase(
          domainName,
          userDetails,
          domainID,
          paymentIntentId,
        );

        return {
          status: 'success',
          message: 'Domain purchased successfully',
          data: {
            domain: domainName,
            domainId: domainID,
            registrationDate: new Date(),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Approx 1 year
          },
          error: null,
        };
      } else {
        // Extract error information if available
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
  ) {
    try {
      // Check domain price to calculate payment amount
      const domainInfo = await this.checkDomainAvailability(domainName);
      if (!domainInfo.isAvailable) {
        throw new Error('Domain is no longer available');
      }

      // Set default price if not available from API
      const domainPrice = domainInfo.price || 12.99;
      const totalAmount = Math.round(domainPrice * years * 100); // Convert to cents for Stripe

      // Create a Stripe payment intent
      const stripe = require('stripe')(
        this.configService.get<string>('STRIPE_SECRET_KEY'),
      );
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'usd',
        description: `Domain registration: ${domainName} (${years} year${years > 1 ? 's' : ''})`,
        metadata: {
          domain: domainName,
          years: years,
          userId: userData.userId || 'guest',
        },
      });

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

      // Return details needed for checkout
      return {
        purchaseUrl: `/domain-checkout/${sessionId}`, // Frontend route for checkout
        sessionId: sessionId,
        paymentIntentId: paymentIntent.id,
        paymentClientSecret: paymentIntent.client_secret,
        amount: totalAmount / 100, // Convert back to dollars for display
        domain: domainName,
        years: years,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
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
      // If response is XML string, parse it
      if (typeof responseData === 'string') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseData, 'text/xml');

        const domainCheckResult =
          xmlDoc.getElementsByTagName('DomainCheckResult')[0];
        return domainCheckResult?.getAttribute('Available') === 'true';
      }
      // If response is already parsed object (JSON format)
      else if (typeof responseData === 'object') {
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

  private async verifyStripePayment(
    paymentIntentId: string,
    domainName: string,
  ): Promise<boolean> {
    try {
      const stripe = require('stripe')(
        this.configService.get<string>('STRIPE_SECRET_KEY'),
      );

      // Retrieve the payment intent to check its status
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      // Check if payment was successful and for the correct domain
      return (
        paymentIntent.status === 'succeeded' &&
        paymentIntent.metadata?.domain === domainName
      );
    } catch (error) {
      console.error('Error verifying Stripe payment:', error);
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
    // In a real implementation, save these details to your database
    // This is a placeholder implementation
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
    paymentIntentId?: string,
  ): Promise<void> {
    // In a real implementation, record the successful purchase in your database
    // This is a placeholder implementation
    console.log('Recording domain purchase:', {
      domainName,
      userDetails,
      domainId,
      paymentIntentId,
      purchaseDate: new Date(),
    });

    // Here you would call your database service to store this information
  }

  private parseNamecheapPriceFromResponse(
    responseData: any,
  ): number | undefined {
    // In a real implementation, you would use an XML parser
    try {
      // This is a placeholder - in real code you'd parse XML properly
      return parseFloat(
        responseData.CommandResponse?.DomainCheckResult?.Price || '0',
      );
    } catch (error) {
      console.error('Error parsing Namecheap price:', error);
      return undefined;
    }
  }

  private parseNamecheapSuggestionsResponse(
    responseData: any,
  ): DomainSuggestion[] {
    // In a real implementation, you would use an XML parser
    try {
      // This is a placeholder - in real code you'd parse XML properly
      const suggestions: DomainSuggestion[] = [];

      // Simulate parsing suggestion data
      const rawSuggestions =
        responseData.CommandResponse?.DomainGetNameSuggestionsResult
          ?.Suggestions?.Suggestion || [];

      for (const suggestion of rawSuggestions) {
        const domain = suggestion?.Domain;
        if (domain) {
          const [sld, ...tldParts] = domain.split('.');
          suggestions.push({
            domain: domain,
            isAvailable: true,
            price: parseFloat(suggestion?.Price || '0'),
            tld: tldParts.join('.'),
          });
        }
      }

      return suggestions;
    } catch (error) {
      console.error('Error parsing Namecheap suggestions:', error);
      return [];
    }
  }

  private isValidDomainFormat(domain: string): boolean {
    // Basic domain validation regex
    const domainRegex =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  }

  private generateSessionId(): string {
    // Simple session ID generator
    return 'sess_' + Math.random().toString(36).substring(2, 15);
  }

  // async domainAvailability(domainName: string) {
  //   try {
  //     const response = await axios.get(`${this.API_URL}`, {
  //       params: {
  //         ApiUser: this.API_USER,
  //         ApiKey: this.API_KEY,
  //         UserName: this.API_USER,
  //         Command: 'namecheap.domains.check',
  //         ClientIP: this.CLIENT_IP,
  //         DomainList: domainName,
  //       },
  //     });

  //     const parser = new DOMParser();
  //     const xmlDoc = parser.parseFromString(response.data, 'text/xml');

  //     const domainCheckResult =
  //       xmlDoc.getElementsByTagName('DomainCheckResult')[0];
  //     const availability = domainCheckResult.getAttribute('Available');

  //     if (availability === 'true') {
  //       return {
  //         status: 'success',
  //         message: `${domainName} is available`,
  //         available: true,
  //       };
  //     } else {
  //       const suggestions = await this.generateDomainSuggestions(domainName);
  //       return {
  //         status: 'fail',
  //         message: `${domainName} is not available`,
  //         available: false,
  //         suggestions,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error in domain availability check:', error);
  //     return {
  //       status: 'fail',
  //       statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  //       message: 'Error processing domain availability check',
  //       data: null,
  //       error: error.message,
  //     };
  //   }
  // }

  // async generateDomainSuggestions(domainName) {
  //   const suggestions: any = [];

  //   const prefixes = ['get', 'try', 'my', 'shop', 'the'];
  //   const suffixes = ['online', 'store', 'web', 'co', 'shop', 'net', 'io'];

  //   for (let prefix of prefixes) {
  //     suggestions.push(`${prefix}${domainName}`);
  //   }
  //   for (let suffix of suffixes) {
  //     suggestions.push(`${domainName}${suffix}`);
  //   }

  //   const availableSuggestions: any = [];
  //   for (let suggestion of suggestions) {
  //     const availability = await this.domainAvailability(suggestion);
  //     if (availability.status === 'success') {
  //       availableSuggestions.push(suggestion);
  //     }
  //   }

  //   return availableSuggestions;
  // }

  // // Domain Purchase
  // async purchaseDomain(domainName: string, userDetails: UserDetailsDto) {
  //   try {
  //     console.log('user details', userDetails);
  //     const response = await axios.get(`${this.API_URL}`, {
  //       params: {
  //         ApiUser: this.API_USER,
  //         ApiKey: this.API_KEY,
  //         UserName: this.API_USER,
  //         Command: 'namecheap.domains.create',
  //         ClientIP: this.CLIENT_IP,
  //         DomainName: domainName,
  //         Years: 1, // Default to 1 year
  //         RegistrantFirstName: userDetails.firstName,
  //         RegistrantLastName: userDetails.lastName,
  //         RegistrantAddress1: userDetails.address1,
  //         RegistrantCity: userDetails.city,
  //         RegistrantStateProvince: userDetails.state,
  //         RegistrantPostalCode: userDetails.zip,
  //         RegistrantCountry: userDetails.country,
  //         RegistrantEmailAddress: userDetails.email,
  //         RegistrantPhone: userDetails.phone,
  //         // Set technical contact details (required)
  //         TechFirstName: userDetails.firstName,
  //         TechLastName: userDetails.lastName,
  //         TechAddress1: userDetails.address1,
  //         TechCity: userDetails.city,
  //         TechStateProvince: userDetails.state,
  //         TechPostalCode: userDetails.zip,
  //         TechCountry: userDetails.country,
  //         TechEmailAddress: userDetails.email,
  //         TechPhone: userDetails.phone,
  //         AdminFirstName: userDetails.firstName,
  //         AdminLastName: userDetails.lastName,
  //         AdminAddress1: userDetails.address1,
  //         AdminCity: userDetails.city,
  //         AdminStateProvince: userDetails.state,
  //         AdminPostalCode: userDetails.zip,
  //         AdminCountry: userDetails.country,
  //         AdminEmailAddress: userDetails.email,
  //         AdminPhone: userDetails.phone,
  //         AuxBillingFirstName: userDetails.firstName,
  //         AuxBillingLastName: userDetails.lastName,
  //         AuxBillingAddress1: userDetails.address1,
  //         AuxBillingCity: userDetails.city,
  //         AuxBillingStateProvince: userDetails.state,
  //         AuxBillingPostalCode: userDetails.zip,
  //         AuxBillingCountry: userDetails.country,
  //         AuxBillingEmailAddress: userDetails.email,
  //         AuxBillingPhone: userDetails.phone,
  //         AddFreeWhoisguard: 'yes',
  //         WGEnabled: 'yes',
  //       },
  //     });

  //     const xmlData = response.data;

  //     // Parse the XML response to JSON
  //     const result = await parseStringPromise(xmlData);

  //     // Extract domain creation status and availability
  //     const domainCreateResult =
  //       result.ApiResponse.CommandResponse[0].DomainCreateResult[0];

  //     const registrationStatus =
  //       domainCreateResult?.getAttribute('Registered') === 'true';
  //     console.log('registration status', registrationStatus);
  //     const domainID = domainCreateResult?.getAttribute('DomainID');

  //     if (registrationStatus && domainID) {
  //       // Record successful purchase in database
  //       await this.recordDomainPurchase(
  //         domainName,
  //         userDetails,
  //         domainID,
  //         paymentIntentId,
  //       );

  //       return {
  //         status: 'success',
  //         message: 'Domain purchased successfully',
  //         data: {
  //           domain: domainName,
  //           domainId: domainID,
  //           registrationDate: new Date(),
  //           expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Approx 1 year
  //         },
  //         error: null,
  //       };
  //     } else {
  //       const errorMsg =
  //         domainCreateResult?.getElementsByTagName('Errors')[0]?.textContent ||
  //         'Unknown error';

  //       return {
  //         status: 'fail',
  //         message: 'Domain purchase failed',
  //         data: null,
  //         error: errorMsg,
  //       };
  //     }
  //   } catch (error) {
  //     console.error('Error purchasing domain:', error);
  //     return {
  //       status: 'fail',
  //       message: 'Error purchasing domain',
  //       data: null,
  //       error: error.message,
  //     };
  //   }
  // }
}
