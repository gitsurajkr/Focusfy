/*
  Warnings:

  - You are about to drop the column `repeat` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."Type" AS ENUM ('EVENT', 'HABIT', 'NORMAL');

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "repeat",
ADD COLUMN     "channel" TEXT[],
ADD COLUMN     "reminder_before" INTEGER,
ADD COLUMN     "reminder_every" INTEGER,
ADD COLUMN     "repeat_interval" INTEGER,
ADD COLUMN     "type" "public"."Type" NOT NULL DEFAULT 'NORMAL';
