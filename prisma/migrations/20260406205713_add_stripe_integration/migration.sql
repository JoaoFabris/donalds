/*
  Warnings:

  - The values [FINISHED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[stripeSessionId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentId]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAYMENT_PROCESSING', 'PAYMENT_CONFIRMED', 'PAYMENT_FAILED', 'IN_PREPARATION', 'READY_FOR_PICKUP', 'SERVED', 'CANCELLED', 'REFUNDED');
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "stripePaymentId" TEXT,
ADD COLUMN     "stripeSessionId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "PaymentIntent" (
    "id" TEXT NOT NULL,
    "orderId" INTEGER NOT NULL,
    "stripePaymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "status" "PaymentStatus" NOT NULL,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentIntent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentIntent_stripePaymentId_key" ON "PaymentIntent"("stripePaymentId");

-- CreateIndex
CREATE INDEX "PaymentIntent_orderId_idx" ON "PaymentIntent"("orderId");

-- CreateIndex
CREATE INDEX "PaymentIntent_stripePaymentId_idx" ON "PaymentIntent"("stripePaymentId");

-- CreateIndex
CREATE INDEX "PaymentIntent_status_idx" ON "PaymentIntent"("status");

-- CreateIndex
CREATE INDEX "PaymentIntent_createdAt_idx" ON "PaymentIntent"("createdAt");

-- CreateIndex
CREATE INDEX "MenuCategory_restaurantId_idx" ON "MenuCategory"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripeSessionId_key" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_stripePaymentId_key" ON "Order"("stripePaymentId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_restaurantId_idx" ON "Order"("restaurantId");

-- CreateIndex
CREATE INDEX "Order_stripeSessionId_idx" ON "Order"("stripeSessionId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE INDEX "OrderProduct_orderId_idx" ON "OrderProduct"("orderId");

-- CreateIndex
CREATE INDEX "OrderProduct_productId_idx" ON "OrderProduct"("productId");

-- CreateIndex
CREATE INDEX "Product_restaurantId_idx" ON "Product"("restaurantId");

-- CreateIndex
CREATE INDEX "Product_menuCategoryId_idx" ON "Product"("menuCategoryId");

-- CreateIndex
CREATE INDEX "Product_price_idx" ON "Product"("price");

-- CreateIndex
CREATE INDEX "Restaurant_slug_idx" ON "Restaurant"("slug");

-- AddForeignKey
ALTER TABLE "PaymentIntent" ADD CONSTRAINT "PaymentIntent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
