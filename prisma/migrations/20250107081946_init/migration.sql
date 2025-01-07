/*
  Warnings:

  - Made the column `download_progress` on table `EventInfo` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "EventInfo" ALTER COLUMN "download_progress" SET NOT NULL;
