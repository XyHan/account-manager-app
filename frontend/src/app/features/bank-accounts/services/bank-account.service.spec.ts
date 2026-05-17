import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { BankAccountService } from './bank-account.service';
import { BANK_ACCOUNT_REPOSITORY } from '../domain/repositories/IBankAccountRepository';
import type { BankAccountListResponse, BankAccountModel } from '../domain/models/bank-account.model';

const mockAccount: BankAccountModel = {
  id: 'abc-123',
  name: 'Compte courant',
  bank: 'BNP Paribas',
  type: 'CHECKING',
  balance: 1500,
  createdAt: '2024-01-01T00:00:00.000Z',
};

const mockListResponse: BankAccountListResponse = {
  accounts: [mockAccount],
  consolidatedBalance: 1500,
};

const findAllSpy = vi.fn().mockReturnValue(of(mockListResponse));
const createSpy = vi.fn().mockReturnValue(of(mockAccount));

const repositoryStub = { findAll: findAllSpy, create: createSpy };

describe('BankAccountService', () => {
  let service: BankAccountService;

  beforeEach(() => {
    findAllSpy.mockReset().mockReturnValue(of(mockListResponse));
    createSpy.mockReset().mockReturnValue(of(mockAccount));

    TestBed.configureTestingModule({
      providers: [
        BankAccountService,
        { provide: BANK_ACCOUNT_REPOSITORY, useValue: repositoryStub },
      ],
    });

    service = TestBed.inject(BankAccountService);
  });

  describe('findAll', () => {
    it('delegates to repository and returns the list response', async () => {
      const result = await firstValueFrom(service.findAll());
      expect(findAllSpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockListResponse);
      expect(result.accounts).toHaveLength(1);
      expect(result.consolidatedBalance).toBe(1500);
    });

    it('propagates repository errors', async () => {
      findAllSpy.mockReturnValue(throwError(() => new Error('Network error')));
      await expect(firstValueFrom(service.findAll())).rejects.toThrow('Network error');
    });
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
