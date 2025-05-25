import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ResellerClubProxyService {
  private readonly baseUrls: Record<string, string>;
  private readonly useProxy: boolean;
  private readonly appUrl: string;

  constructor() {
    this.useProxy = process.env.NODE_ENV === 'development';
    this.appUrl = process.env.APP_URL || 'https://staging-api.raflinks.io';

    const isSandbox = process.env.USE_SANDBOX === 'true';

    this.baseUrls = {
      'domains/available.json': isSandbox
        ? 'https://test.domaincheck.httpapi.com/api'
        : 'https://domaincheck.httpapi.com/api',

      'domains/reseller-price.json': isSandbox
        ? 'https://test.httpapi.com/api'
        : 'https://httpapi.com/api',

      domains: isSandbox
        ? 'https://test.httpapi.com/api'
        : 'https://httpapi.com/api',

      default: isSandbox
        ? 'https://test.httpapi.com/api'
        : 'https://httpapi.com/api',
    };
  }

  async makeRequest(endpoint: string, params: any, method: string = 'GET') {
    if (this.useProxy) {
      return this.makeProxyRequest(endpoint, params, method);
    } else {
      return this.makeDirectRequest(endpoint, params, method);
    }
  }

  private getBaseUrlForEndpoint(endpoint: string): string {
    if (this.baseUrls[endpoint]) {
      return this.baseUrls[endpoint];
    }

    for (const [key, url] of Object.entries(this.baseUrls)) {
      if (endpoint.startsWith(key)) {
        return url;
      }
    }

    return this.baseUrls.default;
  }

  private async makeProxyRequest(
    endpoint: string,
    params: any,
    method: string,
  ) {
    const proxyUrl = `${this.appUrl || 'http://localhost:8080'}/api/proxy/resellerclub`;

    return axios.post(proxyUrl, {
      endpoint,
      method,
      params,
    });
  }

  private async makeDirectRequest(
    endpoint: string,
    params: any,
    method: string,
  ) {
    const baseUrl = this.getBaseUrlForEndpoint(endpoint);

    return axios({
      method,
      url: `${baseUrl}/${endpoint}`,
      params,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'YourApp/1.0',
      },
      timeout: 30000,
    });
  }
}
