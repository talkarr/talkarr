-- CreateEnum
CREATE TYPE "public"."EventProblemType" AS ENUM ('NoRootFolder', 'NoEventInfoGuid', 'RootFolderMarkNotFound', 'HasDownloadError');

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "problems" "public"."EventProblemType"[];
