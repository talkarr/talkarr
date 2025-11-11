/*
  Warnings:

  - Changed the type of `permission` on the `UserPermission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "UserPermission" RENAME "permission" TO "permission_backup";

ALTER TABLE "UserPermission" ADD COLUMN  "permission" TEXT NOT NULL DEFAULT '';
UPDATE "UserPermission" SET permission = 'Admin' WHERE "UserPermission".permission_backup = 'Admin';

ALTER TABLE "UserPermission" ALTER COLUMN "permission" DROP DEFAULT;

ALTER TABLE "UserPermission" DROP COLUMN "permission_backup";

-- DropEnum
DROP TYPE "Permission";
