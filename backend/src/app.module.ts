import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserOrmEntity } from './auth/infrastructure/persistence/orm-entities/UserOrmEntity';
import { CommandLogOrmEntity } from './_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from './_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';
import { EventLogSubscriber } from './_shared/infrastructure/cqrs/middleware/EventLogSubscriber';
import { MessageBusModule } from './_shared/infrastructure/message-bus/bridge/message-bus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'localhost'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        entities: [UserOrmEntity, CommandLogOrmEntity, EventLogOrmEntity],
        migrations: ['dist/database/migrations/*.js'],
        migrationsRun: true,
      }),
    }),
    TypeOrmModule.forFeature([EventLogOrmEntity]),
    MessageBusModule.registerMiddlewares({}),
    AuthModule,
  ],
  providers: [EventLogSubscriber],
})
export class AppModule {}
