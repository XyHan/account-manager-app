import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropCommandLogStatus1778889600001 implements MigrationInterface {
  name = 'DropCommandLogStatus1778889600001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "command_logs" DROP COLUMN IF EXISTS "errorMessage"`);
    await queryRunner.query(`ALTER TABLE "command_logs" DROP COLUMN IF EXISTS "status"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."command_logs_status_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."command_logs_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILURE')`);
    await queryRunner.query(`ALTER TABLE "command_logs" ADD "status" "public"."command_logs_status_enum" NOT NULL DEFAULT 'PENDING'`);
    await queryRunner.query(`ALTER TABLE "command_logs" ADD "errorMessage" text`);
  }
}
