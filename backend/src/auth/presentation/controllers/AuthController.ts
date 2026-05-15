import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandDispatcher } from '../../../_shared/infrastructure/cqrs/middleware/CommandDispatcher';
import { QueryDispatcher } from '../../../_shared/infrastructure/cqrs/middleware/QueryDispatcher';
import { RegisterUserCommand } from '../../application/commands/register-user/RegisterUserCommand';
import { FindUserByEmailQuery } from '../../application/queries/find-user-by-email/FindUserByEmailQuery';
import type { UserReadModel } from '../../domain/models/UserReadModel';
import { UserView } from '../view/UserView';
import { RegisterDto } from '../dto/RegisterDto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandDispatcher: CommandDispatcher,
    private readonly queryDispatcher: QueryDispatcher,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<object> {
    await this.commandDispatcher.dispatch(
      new RegisterUserCommand(dto.id, dto.email, dto.password),
    );

    const readModel = await this.queryDispatcher.dispatch<UserReadModel>(
      new FindUserByEmailQuery(dto.email),
    );

    return UserView.fromReadModel(readModel).serialize();
  }
}
