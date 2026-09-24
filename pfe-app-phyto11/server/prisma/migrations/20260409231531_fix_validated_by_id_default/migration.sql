-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'BLOOM_ALERT';

-- AlterTable
ALTER TABLE "Annotation" ALTER COLUMN "validatedById" DROP DEFAULT;
