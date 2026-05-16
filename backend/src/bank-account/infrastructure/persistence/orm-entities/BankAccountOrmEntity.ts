import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { AccountTypeEnum } from '../../../domain/value-objects/AccountType';

@Entity('bank_accounts')
export class BankAccountOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  name: string;

  @Column()
  bank: string;

  @Column({ type: 'enum', enum: AccountTypeEnum })
  type: AccountTypeEnum;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
