// import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import * as redisStore from 'cache-manager-redis-store';
// import { ENV } from '../../constants';
// import { RedisClientOptions } from 'redis';
// import { CacheService } from './cache.service';

// @Module({
//   imports: [
//     CacheModule.registerAsync<RedisClientOptions>({
//       isGlobal: true,
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => {
//         return {
//           ttl: 600000,
//           isGlobal: true,
//           store: redisStore,
//           host: configService.get(ENV.REDIS_HOST),
//           port: configService.get(ENV.REDIS_PORT),
//         };
//       },
//       inject: [ConfigService],
//     }),
//   ],
//   providers: [CacheService],
//   exports: [CacheService],
// })
// export class CachesModule {}

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ENV } from '../../constants';
import { CacheService } from './cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const useRedis = configService.get('USE_REDIS') === 'true';

        if (useRedis) {
          const redisStore = require('cache-manager-redis-store');
          return {
            store: redisStore,
            host: configService.get(ENV.REDIS_HOST),
            port: configService.get(ENV.REDIS_PORT),
            ttl: 600000,
          };
        }

        return {
          ttl: 600000,
          max: 100,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CachesModule {}