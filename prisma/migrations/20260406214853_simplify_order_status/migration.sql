/*
  Warnings:

  - The values [PAYMENT_PROCESSING,PAYMENT_CONFIRMED,PAYMENT_FAILED,SERVED,REFUNDED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `stripePaymentId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `PaymentIntent` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "PaymentIntent" DROP CONSTRAINT "PaymentIntent_orderId_fkey";

-- DropIndex
DROP INDEX "Order_stripePaymentId_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "stripePaymentId";

-- DropTable
DROP TABLE "PaymentIntent";

-- DropEnum
DROP TYPE "PaymentStatus";
