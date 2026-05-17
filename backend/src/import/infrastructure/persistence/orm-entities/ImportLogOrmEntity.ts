import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

export enum ImportFormatEnum {
  CSV = 'CSV',
  OFX = 'OFX',
}

@Entity('import_logs')
export class ImportLogOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  bankAccountId: string;

  @Column()
  filename: string;

  @Column({ type: 'enum', enum: ImportFormatEnum })
  format: ImportFormatEnum;

  @Column({ type: 'int' })
  addedCount: number;

  @Column({ type: 'int' })
  skippedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
