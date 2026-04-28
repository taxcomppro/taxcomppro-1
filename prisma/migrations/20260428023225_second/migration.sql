-- AlterTable
ALTER TABLE "marketplace_listings" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "toolkit_purchases" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "toolkitId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "membershipGranted" BOOLEAN NOT NULL DEFAULT false,
    "membershipTier" TEXT NOT NULL DEFAULT 'MARKETPLACE',
    "membershipMonths" INTEGER NOT NULL DEFAULT 2,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "toolkit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "toolkit_purchases_stripeSessionId_key" ON "toolkit_purchases"("stripeSessionId");

-- AddForeignKey
ALTER TABLE "toolkit_purchases" ADD CONSTRAINT "toolkit_purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
