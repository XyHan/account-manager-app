import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { BankAccountService } from './bank-account.service';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import type { BankAccountModel } from '../domain/models/bank-account.model';

const mockAccount: BankAccountModel = {
  id: 'abc-123',
  name: 'Compte courant',
  bank: 'BNP Paribas',
  type: 'CHECKING',
  balance: 0,
};

const createSpy = vi.fn().mockReturnValue(of(mockAccount));

const repositoryStub = { create: createSpy };

describe('BankAccountService', () => {
  let service: BankAccountService;

  beforeEach(() => {
    createSpy.mockReset().mockReturnValue(of(mockAccount));

    TestBed.configureTestingModule({
      providers: [
        BankAccountService,
        { provide: BANK_ACCOUNT_REPOSITORY, useValue: repositoryStub },
      ],
    });

    service = TestBed.inject(BankAccountService);
  });

  describe('create', () => {
    it('delegates to repository with the correct payload', async () => {
      const payload = { name: 'Compte courant', bank: 'BNP Paribas', type: 'CHECKING' as const };
      const result = await firstValueFrom(service.create(payload));
      expect(createSpy).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockAccount);
    });

    it('propagates repository errors', async () => {
      createSpy.mockReturnValue(throwError(() => new Error('Network error')));
      await expect(firstValueFrom(service.create({ name: 'x', bank: 'y', type: 'OTHER' }))).rejects.toThrow('Network error');
    });
  });
});
