import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialSchema1747958400000 implements MigrationInterface {
  name = 'CreateInitialSchema1747958400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."users_role_enum" AS ENUM ('USER', 'ADMIN')
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"           UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "email"        VARCHAR      NOT NULL,
        "passwordHash" VARCHAR      NOT NULL,
        "role"         "public"."users_role_enum" NOT NULL DEFAULT 'USER',
        "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updatedAt"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."command_logs_status_enum" AS ENUM ('PENDING', 'SUCCESS', 'FAILURE')
    `);

    await queryRunner.query(`
      CREATE TABLE "command_logs" (
        "id"           UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "name"         VARCHAR      NOT NULL,
        "payload"      JSONB        NOT NULL,
        "userId"       VARCHAR,
        "executedAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "status"       "public"."command_logs_status_enum" NOT NULL DEFAULT 'PENDING',
        "errorMessage" TEXT,
        CONSTRAINT "PK_command_logs" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "event_logs" (
        "id"           UUID         NOT NULL DEFAULT uuid_generate_v4(),
        "name"         VARCHAR      NOT NULL,
        "payload"      JSONB        NOT NULL,
        "commandLogId" VARCHAR,
        "occurredAt"   TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_logs" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "event_logs"`);
    await queryRunner.query(`DROP TABLE "command_logs"`);
    await queryRunner.query(`DROP TYPE "public"."command_logs_status_enum"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
