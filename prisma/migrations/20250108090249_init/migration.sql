/*
  Warnings:

  - Added the required column `bytes` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_video` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mime` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "bytes" INTEGER NOT NULL,
ADD COLUMN     "is_video" BOOLEAN NOT NULL,
ADD COLUMN     "mime" TEXT NOT NULL;
