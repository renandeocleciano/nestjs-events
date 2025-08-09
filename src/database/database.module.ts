import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { CardEntity } from '../modules/cards/card.entity';
import { HolderEntity } from '../modules/holders/holder.entity';
import { StoredEvent } from '../events/event-store.entity';
import { AccountEntity } from '../modules/accounts/account.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      name: 'postgres',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('PG_HOST', 'localhost'),
        port: parseInt(config.get<string>('PG_PORT', '5432'), 10),
        username: config.get<string>('PG_USER', 'postgres'),
        password: config.get<string>('PG_PASSWORD', 'postgres'),
        database: config.get<string>('PG_DATABASE', 'financial'),
        entities: [CardEntity, HolderEntity, AccountEntity],
        synchronize: false,
        migrationsRun: false,
        logging: false,
      }),
    }),
    TypeOrmModule.forRootAsync({
      name: 'mongo',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mongodb',
        url: config.get<string>('MONGO_URI', 'mongodb://localhost:27017/financial_events'),
        useUnifiedTopology: true,
        logging: false,
        entities: [StoredEvent],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}

