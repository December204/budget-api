/* eslint-disable max-len */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1779201254679 implements MigrationInterface {
  name = 'InitialSchema1779201254679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "userId" uuid NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4542dd2f38a61354a040ba9fd57" UNIQUE ("token"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_610102b60fea1455310ccd299d" ON "refresh_tokens" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."recurring_transactions_type_enum" AS ENUM('INCOME', 'EXPENSE')`);
    await queryRunner.query(`CREATE TABLE "recurring_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "categoryId" uuid NOT NULL, "amount" integer NOT NULL, "type" "public"."recurring_transactions_type_enum" NOT NULL, "dayOfMonth" integer, "note" character varying, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6485db3243762a54992dc0ce3b7" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_1d9ebebd06b7a474a6e9075e93" ON "recurring_transactions" ("userId", "isActive") `);
    await queryRunner.query(`CREATE INDEX "IDX_ab59c63725771bd11c6e1d719a" ON "recurring_transactions" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."transactions_type_enum" AS ENUM('INCOME', 'EXPENSE')`);
    await queryRunner.query(`CREATE TABLE "transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "categoryId" uuid NOT NULL, "amount" integer NOT NULL, "type" "public"."transactions_type_enum" NOT NULL, "date" TIMESTAMP NOT NULL, "note" character varying, "isRecurring" boolean NOT NULL DEFAULT false, "recurringTransactionId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_86e965e74f9cc66149cf6c90f6" ON "transactions" ("categoryId") `);
    await queryRunner.query(`CREATE INDEX "IDX_3dae3ed25e0d76f419fcb89ead" ON "transactions" ("userId", "type") `);
    await queryRunner.query(`CREATE INDEX "IDX_31c0fafe7c59f688d0e7e7e322" ON "transactions" ("userId", "date") `);
    await queryRunner.query(`CREATE INDEX "IDX_6bb58f2b6e30cb51a6504599f4" ON "transactions" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."categories_type_enum" AS ENUM('INCOME', 'EXPENSE')`);
    await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "name" character varying NOT NULL, "type" "public"."categories_type_enum" NOT NULL, "color" character varying NOT NULL DEFAULT '#6B7280', "icon" character varying, "isDefault" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_0c9ff8bc60e0360c85c8141a0c" ON "categories" ("userId", "type") `);
    await queryRunner.query(`CREATE INDEX "IDX_13e8b2a21988bec6fdcbb1fa74" ON "categories" ("userId") `);
    await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('BUDGET_ALERT', 'RECURRING_REMINDER', 'SYSTEM')`);
    await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_21e65af2f4f242d4c85a92aff4" ON "notifications" ("userId", "createdAt") `);
    await queryRunner.query(`CREATE INDEX "IDX_5340fc241f57310d243e5ab20b" ON "notifications" ("userId", "isRead") `);
    await queryRunner.query(`CREATE INDEX "IDX_692a909ee0fa9383e7859f9b40" ON "notifications" ("userId") `);
    await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "name" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "budget_limits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "categoryId" uuid NOT NULL, "limitAmount" integer NOT NULL, "month" integer NOT NULL, "year" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d3dfb855488135f0b96790540d9" UNIQUE ("userId", "categoryId", "month", "year"), CONSTRAINT "PK_11fe402eebb5533e9f58781ca1c" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_ee676dbb6b1d790f38828b3f9f" ON "budget_limits" ("userId", "year", "month") `);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_610102b60fea1455310ccd299de" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_ab59c63725771bd11c6e1d719a2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "recurring_transactions" ADD CONSTRAINT "FK_d7578f10f8eeaec6241f19dd6e4" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "transactions" ADD CONSTRAINT "FK_0cd1de0864ad00f51e8979dea26" FOREIGN KEY ("recurringTransactionId") REFERENCES "recurring_transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "budget_limits" ADD CONSTRAINT "FK_cc216e426a6542421e7989a08d9" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "budget_limits" ADD CONSTRAINT "FK_084f4ccaec492818fd1e7908e35" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "budget_limits" DROP CONSTRAINT "FK_084f4ccaec492818fd1e7908e35"`);
    await queryRunner.query(`ALTER TABLE "budget_limits" DROP CONSTRAINT "FK_cc216e426a6542421e7989a08d9"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
    await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_13e8b2a21988bec6fdcbb1fa741"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_0cd1de0864ad00f51e8979dea26"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_86e965e74f9cc66149cf6c90f64"`);
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`);
    await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_d7578f10f8eeaec6241f19dd6e4"`);
    await queryRunner.query(`ALTER TABLE "recurring_transactions" DROP CONSTRAINT "FK_ab59c63725771bd11c6e1d719a2"`);
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_610102b60fea1455310ccd299de"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ee676dbb6b1d790f38828b3f9f"`);
    await queryRunner.query(`DROP TABLE "budget_limits"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_692a909ee0fa9383e7859f9b40"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5340fc241f57310d243e5ab20b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_21e65af2f4f242d4c85a92aff4"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13e8b2a21988bec6fdcbb1fa74"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0c9ff8bc60e0360c85c8141a0c"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TYPE "public"."categories_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6bb58f2b6e30cb51a6504599f4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_31c0fafe7c59f688d0e7e7e322"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dae3ed25e0d76f419fcb89ead"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_86e965e74f9cc66149cf6c90f6"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TYPE "public"."transactions_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ab59c63725771bd11c6e1d719a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1d9ebebd06b7a474a6e9075e93"`);
    await queryRunner.query(`DROP TABLE "recurring_transactions"`);
    await queryRunner.query(`DROP TYPE "public"."recurring_transactions_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_610102b60fea1455310ccd299d"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
  }
}
