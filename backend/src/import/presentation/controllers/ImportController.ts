import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { lastValueFrom } from 'rxjs';
import { COMMAND_BUS, type ICommandBus } from '../../../_shared/domain/bus/ICommandBus';
import { ImportTransactionsCommand } from '../../application/commands/import-transactions/ImportTransactionsCommand';
import { ImportResultView } from '../view/ImportResultView';
import { ImportTransactionsDto } from '../dto/ImportTransactionsDto';
import { OAuthGuard } from '../../../auth/presentation/guards/OAuthGuard';
import { ScopesGuard } from '../../../auth/presentation/guards/ScopesGuard';
import { RolesGuard } from '../../../auth/presentation/guards/RolesGuard';
import { Scopes } from '../../../auth/presentation/decorators/Scopes.decorator';
import { Roles } from '../../../auth/presentation/decorators/Roles.decorator';
import { RoleEnum } from '../../../auth/domain/value-objects/Role';
import type { AuthenticatedRequest } from '../../../auth/presentation/guards/OAuthGuard';
import type { ImportLog } from '../../domain/entities/ImportLog';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@UseGuards(OAuthGuard, ScopesGuard, RolesGuard)
@Scopes('app')
@Roles(RoleEnum.USER, RoleEnum.ADMIN)
@Controller('import')
export class ImportController {
  constructor(@Inject(COMMAND_BUS) private readonly commandBus: ICommandBus) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only CSV files are accepted'), false);
        }
      },
    }),
  )
  async import(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ImportTransactionsDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<object> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const rawContent = file.buffer.toString('utf-8');

    const importLog = await lastValueFrom(
      this.commandBus.execute(
        new ImportTransactionsCommand(
          req.user.userId,
          dto.bankAccountId,
          file.originalname,
          'CSV',
          rawContent,
        ),
      ),
    ) as ImportLog;

    return ImportResultView.from(
      importLog.filename,
      importLog.format,
      importLog.addedCount,
      importLog.skippedCount,
    ).serialize();
  }
}
