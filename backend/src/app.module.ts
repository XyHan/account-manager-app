import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { BankAccountModule } from './bank-account/bank-account.module';
import { UserOrmEntity } from './auth/infrastructure/persistence/orm-entities/UserOrmEntity';
import { BankAccountOrmEntity } from './bank-account/infrastructure/persistence/orm-entities/BankAccountOrmEntity';
import { OAuthClientOrmEntity } from './auth/infrastructure/persistence/orm-entities/OAuthClientOrmEntity';
import { OAuthAuthorizationCodeOrmEntity } from './auth/infrastructure/persistence/orm-entities/OAuthAuthorizationCodeOrmEntity';
import { OAuthTokenOrmEntity } from './auth/infrastructure/persistence/orm-entities/OAuthTokenOrmEntity';
import { CommandLogOrmEntity } from './_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from './_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [
          UserOrmEntity,
          OAuthClientOrmEntity,
          OAuthAuthorizationCodeOrmEntity,
          OAuthTokenOrmEntity,
          CommandLogOrmEntity,
          EventLogOrmEntity,
          BankAccountOrmEntity,
        ],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    BankAccountModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
