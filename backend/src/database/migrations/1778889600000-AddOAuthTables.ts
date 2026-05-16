import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthTables1778889600000 implements MigrationInterface {
  name = 'AddOAuthTables1778889600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "oauth_clients" (
        "id"           UUID    NOT NULL DEFAULT uuid_generate_v4(),
        "clientId"     VARCHAR NOT NULL,
        "clientSecret" VARCHAR,
        "grants"       TEXT    NOT NULL,
        "redirectUris" TEXT    NOT NULL,
        "scopes"       TEXT    NOT NULL,
        CONSTRAINT "PK_oauth_clients" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_oauth_clients_clientId" UNIQUE ("clientId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "oauth_authorization_codes" (
        "id"                  UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "code"                VARCHAR     NOT NULL,
        "codeChallenge"       VARCHAR     NOT NULL,
        "codeChallengeMethod" VARCHAR     NOT NULL,
        "redirectUri"         VARCHAR     NOT NULL,
        "scope"               VARCHAR     NOT NULL,
        "expiresAt"           TIMESTAMPTZ NOT NULL,
        "userId"              UUID        NOT NULL,
        "clientId"            VARCHAR     NOT NULL,
        "used"                BOOLEAN     NOT NULL DEFAULT false,
        "createdAt"           TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_oauth_authorization_codes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_oauth_authorization_codes_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."oauth_tokens_userrole_enum" AS ENUM ('USER', 'ADMIN')
    `);

    await queryRunner.query(`
      CREATE TABLE "oauth_tokens" (
        "id"                     UUID        NOT NULL DEFAULT uuid_generate_v4(),
        "accessToken"            VARCHAR     NOT NULL,
        "accessTokenExpiresAt"   TIMESTAMPTZ NOT NULL,
        "refreshToken"           VARCHAR,
        "refreshTokenExpiresAt"  TIMESTAMPTZ,
        "scope"                  VARCHAR     NOT NULL,
        "userId"                 UUID        NOT NULL,
        "userRole"               "public"."oauth_tokens_userrole_enum" NOT NULL DEFAULT 'USER',
        "clientId"               VARCHAR     NOT NULL,
        "revoked"                BOOLEAN     NOT NULL DEFAULT false,
        "createdAt"              TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_oauth_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_oauth_tokens_accessToken" UNIQUE ("accessToken"),
        CONSTRAINT "UQ_oauth_tokens_refreshToken" UNIQUE ("refreshToken")
      )
    `);

    // Seed du client OAuth2 interne
    await queryRunner.query(`
      INSERT INTO "oauth_clients" ("clientId", "clientSecret", "grants", "redirectUris", "scopes")
      VALUES ('app', NULL, 'authorization_code', 'http://localhost:4200/auth/callback', 'app')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "oauth_clients" WHERE "clientId" = 'app'`);
    await queryRunner.query(`DROP TABLE "oauth_tokens"`);
    await queryRunner.query(`DROP TYPE "public"."oauth_tokens_userrole_enum"`);
    await queryRunner.query(`DROP TABLE "oauth_authorization_codes"`);
    await queryRunner.query(`DROP TABLE "oauth_clients"`);
  }
}