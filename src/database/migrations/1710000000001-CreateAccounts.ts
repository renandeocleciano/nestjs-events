import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAccounts1710000000001 implements MigrationInterface {
  public name = 'CreateAccounts1710000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "accounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "card_id" uuid NOT NULL,
        "amount" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "fk_accounts_card" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE
      );
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_accounts_card_id" ON "accounts" ("card_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_accounts_card_id";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "accounts";`);
  }
}

