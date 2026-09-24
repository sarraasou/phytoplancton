/*
  Warnings:

  - You are about to drop the `ProjectPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectPermission" DROP CONSTRAINT "ProjectPermission_grantedById_fkey";

-- DropForeignKey
ALTER TABLE "ProjectPermission" DROP CONSTRAINT "ProjectPermission_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectPermission" DROP CONSTRAINT "ProjectPermission_userId_fkey";

-- DropTable
DROP TABLE "ProjectPermission";

-- CreateTable
CREATE TABLE "project_permissions" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "grantedById" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT false,
    "canUpload" BOOLEAN NOT NULL DEFAULT false,
    "canAnnotate" BOOLEAN NOT NULL DEFAULT false,
    "canValidate" BOOLEAN NOT NULL DEFAULT false,
    "canEdit" BOOLEAN NOT NULL DEFAULT false,
    "canDelete" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "project_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_permissions_projectId_idx" ON "project_permissions"("projectId");

-- CreateIndex
CREATE INDEX "project_permissions_userId_idx" ON "project_permissions"("userId");

-- CreateIndex
CREATE INDEX "project_permissions_isActive_idx" ON "project_permissions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "project_permissions_projectId_userId_key" ON "project_permissions"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "project_permissions" ADD CONSTRAINT "project_permissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_permissions" ADD CONSTRAINT "project_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_permissions" ADD CONSTRAINT "project_permissions_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
