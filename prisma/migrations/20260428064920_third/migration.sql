-- CreateEnum
CREATE TYPE "BlastStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'APPROVED', 'DELIVERED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'ACTIVE', 'PAUSED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdPlacement" AS ENUM ('CENTER_COLUMN', 'LEFT_COLUMN');

-- CreateEnum
CREATE TYPE "FeaturedListingStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'EXPIRED');

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "blastId" TEXT,
ADD COLUMN     "isSponsored" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "featured_listing_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "status" "FeaturedListingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "stripeSessionId" TEXT,
    "rejectionReason" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "featured_listing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_blasts" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "filterRoles" TEXT[],
    "filterCities" TEXT[],
    "filterStates" TEXT[],
    "recipientCount" INTEGER NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "stripeSessionId" TEXT,
    "status" "BlastStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "blastMonth" TEXT NOT NULL,
    "rejectionReason" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_blasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_ads" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "placement" "AdPlacement" NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "stripeSessionId" TEXT,
    "status" "AdStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "rejectionReason" TEXT,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pro_ads_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "featured_listing_requests" ADD CONSTRAINT "featured_listing_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "featured_listing_requests" ADD CONSTRAINT "featured_listing_requests_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "marketplace_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_blastId_fkey" FOREIGN KEY ("blastId") REFERENCES "message_blasts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_blasts" ADD CONSTRAINT "message_blasts_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_ads" ADD CONSTRAINT "pro_ads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
