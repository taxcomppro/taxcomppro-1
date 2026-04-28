-- CreateEnum
CREATE TYPE "AppStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "certifications" TEXT[],
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "linkedIn" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "mediaPhotos" TEXT[],
ADD COLUMN     "mission" TEXT,
ADD COLUMN     "specialties" TEXT[],
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "yearsExperience" INTEGER;

-- CreateTable
CREATE TABLE "professional_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AppStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_services" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" TEXT,
    "emoji" TEXT NOT NULL DEFAULT '⭐',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pro_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pro_reviews" (
    "id" TEXT NOT NULL,
    "proId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pro_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "professional_applications_userId_key" ON "professional_applications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "pro_reviews_proId_reviewerId_key" ON "pro_reviews"("proId", "reviewerId");

-- AddForeignKey
ALTER TABLE "professional_applications" ADD CONSTRAINT "professional_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_services" ADD CONSTRAINT "pro_services_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_reviews" ADD CONSTRAINT "pro_reviews_proId_fkey" FOREIGN KEY ("proId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pro_reviews" ADD CONSTRAINT "pro_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
