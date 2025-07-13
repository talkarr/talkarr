/*
  Warnings:

  - A unique constraint covering the columns `[sub]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "sub" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_sub_key" ON "User"("sub");
