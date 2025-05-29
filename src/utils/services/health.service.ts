import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private health: HealthCheckService,
    private mongooseIndicator: MongooseHealthIndicator,
    private memoryIndicator: MemoryHealthIndicator,
  ) {}

  async simpleHealthCheck() {
    try {
      const dbStatus =
        this.connection.readyState === 1 ? 'connected' : 'disconnected';

      if (dbStatus === 'disconnected') {
        throw new Error('Database not connected');
      }

      const additionalChecks = await this.health.check([
        () => this.mongooseIndicator.pingCheck('mongodb', { timeout: 1500 }),
        () => this.memoryIndicator.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB
        () => this.memoryIndicator.checkRSS('memory_rss', 300 * 1024 * 1024), // 300MB
      ]);

      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: process.env.SERVICE_NAME || 'nestjs-service',
        version: process.env.npm_package_version || '1.0.0',
        database: {
          status: dbStatus,
          name: this.connection.name,
        },
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        additionalChecks,
      };
    } catch (error) {
      this.logger.error('Health check failed:', error.message);
      throw new Error(`Service unhealthy: ${error.message}`);
    }
  }
}
