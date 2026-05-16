import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBusModule } from '../_shared/infrastructure/message-bus/bridge/message-bus.module';
import { CommandLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/CommandLogMiddleware';
import { EventLogMiddleware } from '../_shared/infrastructure/cqrs/middleware/EventLogMiddleware';
import { CommandLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';
import { EventLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/EventLog.orm-entity';
import { UserOrmEntity } from './infrastructure/persistence/orm-entities/UserOrmEntity';
import { OAuthClientOrmEntity } from './infrastructure/persistence/orm-entities/OAuthClientOrmEntity';
import { OAuthAuthorizationCodeOrmEntity } from './infrastructure/persistence/orm-entities/OAuthAuthorizationCodeOrmEntity';
import { OAuthTokenOrmEntity } from './infrastructure/persistence/orm-entities/OAuthTokenOrmEntity';
import { UserRepository } from './infrastructure/persistence/repositories/UserRepository';
import { UserFinder } from './infrastructure/persistence/finders/UserFinder';
import { OAuthService } from './infrastructure/oauth/OAuthService';
import { RegisterUserCommandHandler } from './application/commands/register-user/RegisterUserCommandHandler';
import { FindUserByEmailQueryHandler } from './application/queries/find-user-by-email/FindUserByEmailQueryHandler';
import { AuthController } from './presentation/controllers/AuthController';
import { USER_REPOSITORY } from './domain/repositories/IUserRepository';
import { USER_FINDER } from './domain/finders/IUserFinder';

@Module({
  imports: [
    MessageBusModule.registerMiddlewares({
      commandBus: [CommandLogMiddleware],
      eventBus: [EventLogMiddleware],
      imports: [TypeOrmModule.forFeature([CommandLogOrmEntity, EventLogOrmEntity])],
    }),
    TypeOrmModule.forFeature([
      UserOrmEntity,
      OAuthClientOrmEntity,
      OAuthAuthorizationCodeOrmEntity,
      OAuthTokenOrmEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserCommandHandler,
    FindUserByEmailQueryHandler,
    OAuthService,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: USER_FINDER, useClass: UserFinder },
  ],
  exports: [OAuthService],
})
export class AuthModule {}
