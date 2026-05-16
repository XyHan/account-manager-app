import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBankAccountsTable1778889600002 implements MigrationInterface {
  name = 'CreateBankAccountsTable1778889600002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."bank_accounts_type_enum" AS ENUM ('CHECKING', 'SAVINGS', 'OTHER')
    `);

    await queryRunner.query(`
      CREATE TABLE "bank_accounts" (
        "id"        UUID         NOT NULL,
        "userId"    UUID         NOT NULL,
        "name"      VARCHAR      NOT NULL,
        "bank"      VARCHAR      NOT NULL,
        "type"      "public"."bank_accounts_type_enum" NOT NULL,
        "balance"   DECIMAL(15,2) NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bank_accounts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bank_accounts_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "bank_accounts"`);
    await queryRunner.query(`DROP TYPE "public"."bank_accounts_type_enum"`);
  }
}
