import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { RoleEnum } from '../../../domain/value-objects/Role';

@Entity('oauth_tokens')
export class OAuthTokenOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  accessToken: string;

  @Column()
  accessTokenExpiresAt: Date;

  @Column({ unique: true, nullable: true, type: 'varchar' })
  refreshToken: string | null;

  @Column({ nullable: true, type: 'timestamptz' })
  refreshTokenExpiresAt: Date | null;

  @Column()
  scope: string;

  @Column()
  userId: string;

  @Column({ type: 'enum', enum: RoleEnum, default: RoleEnum.USER })
  userRole: RoleEnum;

  @Column()
  clientId: string;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}