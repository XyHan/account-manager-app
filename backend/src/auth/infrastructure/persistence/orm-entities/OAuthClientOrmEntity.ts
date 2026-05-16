import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('oauth_clients')
export class OAuthClientOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  clientId: string;

  @Column({ nullable: true, type: 'varchar' })
  clientSecret: string | null;

  @Column('simple-array')
  grants: string[];

  @Column('simple-array')
  redirectUris: string[];

  @Column('simple-array')
  scopes: string[];
}