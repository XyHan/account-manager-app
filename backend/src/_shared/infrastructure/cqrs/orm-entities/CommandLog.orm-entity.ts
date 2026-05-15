import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CommandLogStatus } from './CommandLogStatus';

@Entity('command_logs')
export class CommandLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ nullable: true, type: 'varchar' })
  userId: string | null;

  @CreateDateColumn()
  executedAt: Date;

  @Column({ type: 'enum', enum: CommandLogStatus, default: CommandLogStatus.PENDING })
  status: CommandLogStatus;

  @Column({ nullable: true, type: 'text' })
  errorMessage: string | null;
}
