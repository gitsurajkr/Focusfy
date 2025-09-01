-- AlterTable
ALTER TABLE "public"."Task" ADD COLUMN     "lastNotificationType" TEXT,
ADD COLUMN     "lastNotifiedAt" TIMESTAMP(3);
