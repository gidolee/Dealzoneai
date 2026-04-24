-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'MERCHANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PRODUCT_VIEW', 'ADD_TO_CART', 'PURCHASE', 'SEARCH', 'CLICK');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('ACTIVE', 'PAUSED', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Merchant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Merchant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "discountPercent" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "type" "EventType" NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasoning" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "orderValue" DECIMAL(10,2) NOT NULL,
    "discountValue" DECIMAL(10,2) NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignMetric" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "redemptionsCount" INTEGER NOT NULL DEFAULT 0,
    "incrementalRevenue" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "marginImpact" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "CampaignMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Merchant_userId_key" ON "Merchant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_code_key" ON "Deal"("code");

-- CreateIndex
CREATE INDEX "UserEvent_userId_createdAt_idx" ON "UserEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Recommendation_userId_score_idx" ON "Recommendation"("userId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_dealId_key" ON "Recommendation"("userId", "dealId");

-- CreateIndex
CREATE INDEX "Redemption_dealId_redeemedAt_idx" ON "Redemption"("dealId", "redeemedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMetric_dealId_date_key" ON "CampaignMetric"("dealId", "date");

-- AddForeignKey
ALTER TABLE "Merchant" ADD CONSTRAINT "Merchant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEvent" ADD CONSTRAINT "UserEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Redemption" ADD CONSTRAINT "Redemption_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMetric" ADD CONSTRAINT "CampaignMetric_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

