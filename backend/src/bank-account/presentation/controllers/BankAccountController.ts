import { Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CommandBus } from '../../../_shared/infrastructure/message-bus/bridge/bus/command.bus';
import { CreateBankAccountCommand } from '../../application/commands/create-bank-account/CreateBankAccountCommand';
import { CreateBankAccountDto } from '../dto/CreateBankAccountDto';
import { BankAccountView } from '../view/BankAccountView';
import { OAuthGuard } from '../../../auth/presentation/guards/OAuthGuard';
import { ScopesGuard } from '../../../auth/presentation/guards/ScopesGuard';
import { RolesGuard } from '../../../auth/presentation/guards/RolesGuard';
import { Scopes } from '../../../auth/presentation/decorators/Scopes.decorator';
import { Roles } from '../../../auth/presentation/decorators/Roles.decorator';
import { RoleEnum } from '../../../auth/domain/value-objects/Role';
import type { AuthenticatedRequest } from '../../../auth/presentation/guards/OAuthGuard';
import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

@UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
@Scopes('app')
@Roles(RoleEnum.USER, RoleEnum.ADMIN)
@Controller('bank-accounts')
export class BankAccountController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateBankAccountDto): Promise<object> {
    const bankAccountId = uuidV7();

    await lastValueFrom(
      this.commandBus.execute(
        new CreateBankAccountCommand(req.user.userId, bankAccountId, dto.name, dto.bank, dto.type),
      ),
    );

    return BankAccountView.create(bankAccountId, dto.name, dto.bank, dto.type, 0).serialize();
  }
}
