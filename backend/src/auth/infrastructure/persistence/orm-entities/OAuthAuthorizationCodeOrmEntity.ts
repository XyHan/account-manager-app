import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oauth_authorization_codes')
export class OAuthAuthorizationCodeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  codeChallenge: string;

  @Column()
  codeChallengeMethod: string;

  @Column()
  redirectUri: string;

  @Column()
  scope: string;

  @Column()
  expiresAt: Date;

  @Column()
  userId: string;

  @Column()
  clientId: string;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  createdAt: Date;
}