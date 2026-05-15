import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageBusModule } from '../_shared/infrastructure/message-bus/bridge/message-bus.module';
import { UserOrmEntity } from './infrastructure/persistence/orm-entities/UserOrmEntity';
import { UserRepository } from './infrastructure/persistence/repositories/UserRepository';
import { UserFinder } from './infrastructure/persistence/finders/UserFinder';
import { RegisterUserCommandHandler } from './application/commands/register-user/RegisterUserCommandHandler';
import { FindUserByEmailQueryHandler } from './application/queries/find-user-by-email/FindUserByEmailQueryHandler';
import { AuthController } from './presentation/controllers/AuthController';
import { USER_REPOSITORY } from './domain/repositories/IUserRepository';
import { USER_FINDER } from './domain/finders/IUserFinder';
import { CommandDispatcher } from '../_shared/infrastructure/cqrs/middleware/CommandDispatcher';
import { QueryDispatcher } from '../_shared/infrastructure/cqrs/middleware/QueryDispatcher';
import { CommandLogOrmEntity } from '../_shared/infrastructure/cqrs/orm-entities/CommandLog.orm-entity';

@Module({
  imports: [
    MessageBusModule.registerMiddlewares({}),
    TypeOrmModule.forFeature([UserOrmEntity, CommandLogOrmEntity]),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUserCommandHandler,
    FindUserByEmailQueryHandler,
    CommandDispatcher,
    QueryDispatcher,
    { provide: USER_REPOSITORY, useClass: UserRepository },
    { provide: USER_FINDER, useClass: UserFinder },
  ],
})
export class AuthModule {}
