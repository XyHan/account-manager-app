import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('event_logs')
export class EventLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ nullable: true, type: 'varchar' })
  commandLogId: string | null;

  @CreateDateColumn()
  occurredAt: Date;
}
