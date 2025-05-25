import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { Response } from 'express';
import { ResellerClubProxyRequestDto } from './utils/dtos/resellerclub.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('api/proxy/resellerclub')
  async proxyResellerClub(
    @Body() body: ResellerClubProxyRequestDto,
    @Res() res: Response,
  ) {
    try {
      const { endpoint, params, method = 'GET', headers: clientHeaders } = body;

      if (!endpoint) {
        return res.status(400).json({ error: 'Endpoint is required' });
      }

      console.log(`Proxying ${method} request to ${endpoint}`);
      console.log('Params:', params);

      const baseUrl = this.getBaseUrlForEndpoint(endpoint);
      const targetUrl = `${baseUrl}/${endpoint}`;

      console.log(`Proxying request to: ${targetUrl}`);

      const response = await axios({
        method,
        url: targetUrl,
        params,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'YourApp/1.0',
          ...clientHeaders,
        },
        timeout: 30000,
      });

      console.log(`Proxy success for ${endpoint}`);
      res.json(response.data);
    } catch (error) {
      console.log("erorr", error.response)
      console.error('Proxy error:', {
        endpoint: body.endpoint,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      console.error('Proxy error:', error.message);
      const status = error.response?.status || 500;
      res.status(status).json({
        error: error.message,
        data: error.response?.data,
      });
    }
  }

  private getBaseUrlForEndpoint(endpoint: string): string {
    const isSandbox = process.env.USE_SANDBOX === 'true';

    const baseUrls = {
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

    if (baseUrls[endpoint]) {
      return baseUrls[endpoint];
    }

    for (const [key, url] of Object.entries(baseUrls)) {
      if (endpoint.startsWith(key)) {
        return url;
      }
    }

    return baseUrls.default;
  }
}
