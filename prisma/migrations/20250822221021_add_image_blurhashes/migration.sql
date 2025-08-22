-- AlterTable
ALTER TABLE "public"."Conference" ADD COLUMN     "logo_url_blur" TEXT;

-- AlterTable
ALTER TABLE "public"."Event" ADD COLUMN     "poster_url_blur" TEXT,
ADD COLUMN     "thumb_url_blur" TEXT;
