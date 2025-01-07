-- AlterTable
ALTER TABLE "EventInfo" ADD COLUMN     "download_exit_code" INTEGER;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
