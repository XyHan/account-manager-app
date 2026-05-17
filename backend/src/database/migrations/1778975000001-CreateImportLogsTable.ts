import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateImportLogsTable1778975000001 implements MigrationInterface {
  name = 'CreateImportLogsTable1778975000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."import_logs_format_enum" AS ENUM ('CSV', 'OFX')
    `);

    await queryRunner.query(`
      CREATE TABLE "import_logs" (
        "id"           UUID         NOT NULL,
        "userId"       UUID         NOT NULL,
        "bankAccountId" UUID        NOT NULL,
        "filename"     VARCHAR      NOT NULL,
        "format"       "public"."import_logs_format_enum" NOT NULL,
        "addedCount"   INT          NOT NULL DEFAULT 0,
        "skippedCount" INT          NOT NULL DEFAULT 0,
        "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_import_logs"             PRIMARY KEY ("id"),
        CONSTRAINT "FK_import_logs_user"        FOREIGN KEY ("userId")        REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_import_logs_bank_account" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "import_logs"`);
    await queryRunner.query(`DROP TYPE "public"."import_logs_format_enum"`);
  }
}
