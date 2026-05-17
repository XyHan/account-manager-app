import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('transactions')
export class TransactionOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bankAccountId: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: string;

  @Column({ type: 'text' })
  labelEncrypted: string;

  @Column()
  labelIv: string;

  @Column()
  hash: string;

  @Column({ nullable: true, type: 'uuid' })
  importLogId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
