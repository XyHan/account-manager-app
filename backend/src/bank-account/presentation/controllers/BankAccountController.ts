import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CommandBus } from '../../../_shared/infrastructure/message-bus/bridge/bus/command.bus';
import { QueryBus } from '../../../_shared/infrastructure/message-bus/bridge/bus/query.bus';
import { CreateBankAccountCommand } from '../../application/commands/create-bank-account/CreateBankAccountCommand';
import { UpdateBankAccountCommand } from '../../application/commands/update-bank-account/UpdateBankAccountCommand';
import { DeleteBankAccountCommand } from '../../application/commands/delete-bank-account/DeleteBankAccountCommand';
import { ListBankAccountsQuery } from '../../application/queries/list-bank-accounts/ListBankAccountsQuery';
import { CreateBankAccountDto } from '../dto/CreateBankAccountDto';
import { UpdateBankAccountDto } from '../dto/UpdateBankAccountDto';
import { BankAccountView } from '../view/BankAccountView';
import { BankAccountListView } from '../view/BankAccountListView';
import { OAuthGuard } from '../../../auth/presentation/guards/OAuthGuard';
import { ScopesGuard } from '../../../auth/presentation/guards/ScopesGuard';
import { RolesGuard } from '../../../auth/presentation/guards/RolesGuard';
import { Scopes } from '../../../auth/presentation/decorators/Scopes.decorator';
import { Roles } from '../../../auth/presentation/decorators/Roles.decorator';
import { RoleEnum } from '../../../auth/domain/value-objects/Role';
import type { AuthenticatedRequest } from '../../../auth/presentation/guards/OAuthGuard';
import type { BankAccountCollection } from '../../domain/collection/BankAccountCollection';
import type { BankAccount } from '../../domain/entities/BankAccount';
import { uuidV7 } from '../../../_shared/domain/uuid/uuid-v7';

@UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
@Scopes('app')
@Roles(RoleEnum.USER, RoleEnum.ADMIN)
@Controller('bank-accounts')
export class BankAccountController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Req() req: AuthenticatedRequest): Promise<object> {
    const accounts = await lastValueFrom(
      this.queryBus.execute(new ListBankAccountsQuery(req.user.userId)),
    ) as BankAccountCollection;

    return BankAccountListView.from(accounts, accounts.totalBalance()).serialize();
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateBankAccountDto,
  ): Promise<object> {
    const account = await lastValueFrom(
      this.commandBus.execute(
        new UpdateBankAccountCommand(req.user.userId, id, dto.name, dto.bank, dto.type),
      ),
    ) as BankAccount;

    return BankAccountView.create(
      account.id.toString(),
      account.name.toString(),
      account.bank.toString(),
      account.type.toString(),
      account.balance.toNumber(),
    ).serialize();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Req() req: AuthenticatedRequest, @Param('id') id: string): Promise<void> {
    await lastValueFrom(
      this.commandBus.execute(new DeleteBankAccountCommand(req.user.userId, id)),
    );
  }

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
