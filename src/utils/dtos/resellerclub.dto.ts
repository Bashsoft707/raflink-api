import {
  IsString,
  IsOptional,
  IsObject,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export class ResellerClubAuthDto {
  @ApiProperty({
    description: 'ResellerClub Auth User ID',
    example: '773457',
  })
  @IsString()
  'auth-userid': string;

  @ApiProperty({
    description: 'ResellerClub API Key',
    example: 'your-api-key-here',
  })
  @IsString()
  'api-key': string;
}

export class DomainAvailabilityParamsDto extends ResellerClubAuthDto {
  @ApiProperty({
    description: 'Domain name to check (without TLD)',
    example: 'example',
  })
  @IsString()
  'domain-name': string;

  @ApiProperty({
    description: 'Top Level Domains to check',
    example: 'com,net,org',
  })
  @IsString()
  tlds: string;
}

export class DomainPriceParamsDto extends ResellerClubAuthDto {
  @ApiProperty({
    description: 'Domain name with TLD',
    example: 'example.com',
  })
  @IsString()
  'domain-name': string;
}

export class ProxyRequestHeadersDto {
  @ApiPropertyOptional({
    description: 'Content Type header',
    example: 'application/json',
  })
  @IsOptional()
  @IsString()
  'Content-Type'?: string;

  @ApiPropertyOptional({
    description: 'User Agent header',
    example: 'YourApp/1.0',
  })
  @IsOptional()
  @IsString()
  'User-Agent'?: string;

  @ApiPropertyOptional({
    description: 'Authorization header',
    example: 'Bearer your-token-here',
  })
  @IsOptional()
  @IsString()
  'Authorization'?: string;

  // Allow additional headers
  [key: string]: any;
}

export class ResellerClubProxyRequestDto {
  @ApiProperty({
    description: 'API endpoint path',
    example: 'domains/available.json',
    enum: [
      'domains/available.json',
      'domains/reseller-price.json',
      'domains/register.json',
      'domains/modify-contact.json',
      'domains/modify-ns.json',
      'domains/renew.json',
      'domains/delete.json',
    ],
  })
  @IsString()
  endpoint: string;

  @ApiProperty({
    description: 'HTTP method for the request',
    enum: HttpMethod,
    default: HttpMethod.GET,
  })
  @IsEnum(HttpMethod)
  @IsOptional()
  method?: HttpMethod = HttpMethod.GET;

  @ApiProperty({
    description: 'Request parameters including auth credentials',
    type: 'object',
    additionalProperties: true,
    example: {
      'auth-userid': '113492',
      'api-key': 'your-api-key',
      'domain-name': 'example',
      tlds: 'com,net,org',
    },
  })
  @IsObject()
  params: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional headers to send with the request',
    type: ProxyRequestHeadersDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ProxyRequestHeadersDto)
  headers?: ProxyRequestHeadersDto;
}

export class ProxyResponseDto {
  @ApiProperty({
    description: 'Success status of the proxy request',
  })
  success: boolean;

  @ApiProperty({
    description: 'Response data from the external API',
  })
  data?: any;

  @ApiProperty({
    description: 'Error message if request failed',
  })
  error?: string;

  @ApiProperty({
    description: 'HTTP status code from the external API',
  })
  statusCode?: number;
}

// Specific DTOs for different ResellerClub endpoints
export class DomainAvailabilityRequestDto {
  @ApiProperty({
    description:
      'Always "domains/available.json" for domain availability check',
  })
  @IsString()
  endpoint: string = 'domains/available.json';

  @ApiProperty({
    description: 'HTTP method - always GET for availability check',
  })
  @IsEnum(HttpMethod)
  method: HttpMethod = HttpMethod.GET;

  @ApiProperty({
    description: 'Domain availability check parameters',
    type: DomainAvailabilityParamsDto,
  })
  @ValidateNested()
  @Type(() => DomainAvailabilityParamsDto)
  params: DomainAvailabilityParamsDto;
}

export class DomainPriceRequestDto {
  @ApiProperty({
    description: 'Always "domains/reseller-price.json" for domain pricing',
  })
  @IsString()
  endpoint: string = 'domains/reseller-price.json';

  @ApiProperty({
    description: 'HTTP method - always GET for price check',
  })
  @IsEnum(HttpMethod)
  method: HttpMethod = HttpMethod.GET;

  @ApiProperty({
    description: 'Domain price check parameters',
    type: DomainPriceParamsDto,
  })
  @ValidateNested()
  @Type(() => DomainPriceParamsDto)
  params: DomainPriceParamsDto;
}
