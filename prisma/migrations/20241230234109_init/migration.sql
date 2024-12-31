-- CreateTable
CREATE TABLE "Conference" (
    "acronym" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "aspect_ratio" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "schedule_url" TEXT NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("slug")
);

-- CreateTable
CREATE TABLE "Person" (
    "name" TEXT NOT NULL,
    "eventInternal_id" TEXT NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Tag" (
    "name" TEXT NOT NULL,
    "eventInternal_id" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Event" (
    "internal_id" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thumb_url" TEXT NOT NULL,
    "poster_url" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "frontend_link" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("internal_id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_eventInternal_id_fkey" FOREIGN KEY ("eventInternal_id") REFERENCES "Event"("internal_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_eventInternal_id_fkey" FOREIGN KEY ("eventInternal_id") REFERENCES "Event"("internal_id") ON DELETE RESTRICT ON UPDATE CASCADE;
