import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTransactionsTable1778975000000 implements MigrationInterface {
  name = 'CreateTransactionsTable1778975000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "transactions" (
        "id"             UUID         NOT NULL,
        "userId"         UUID         NOT NULL,
        "bankAccountId"  UUID         NOT NULL,
        "date"           DATE         NOT NULL,
        "amount"         DECIMAL(15,2) NOT NULL,
        "labelEncrypted" TEXT         NOT NULL,
        "labelIv"        VARCHAR      NOT NULL,
        "hash"           VARCHAR      NOT NULL,
        "importLogId"    UUID,
        "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT now(),
        CONSTRAINT "PK_transactions"             PRIMARY KEY ("id"),
        CONSTRAINT "FK_transactions_user"        FOREIGN KEY ("userId")        REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_transactions_bank_account" FOREIGN KEY ("bankAccountId") REFERENCES "bank_accounts"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_transactions_hash_account" UNIQUE ("hash", "bankAccountId")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "transactions"`);
  }
}
