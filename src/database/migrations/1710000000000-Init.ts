import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1710000000000 implements MigrationInterface {
  public name = 'Init1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "cards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document" character varying(50) NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_cards_document" UNIQUE ("document"), CONSTRAINT "PK_cards_id" PRIMARY KEY ("id"));`,
    );
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_cards_document" ON "cards" ("document");`);

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "holders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "document" character varying(50) NOT NULL, "cardId" uuid NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(), "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT "UQ_holders_document" UNIQUE ("document"), CONSTRAINT "PK_holders_id" PRIMARY KEY ("id"), CONSTRAINT "FK_holders_cardId_cards_id" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE NO ACTION);`,
    );
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_holders_document" ON "holders" ("document");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "holders"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cards"`);
  }
}

