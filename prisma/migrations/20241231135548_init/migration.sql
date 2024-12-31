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

    CONSTRAINT "Person_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Tag" (
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "Event" (
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

    CONSTRAINT "Event_pkey" PRIMARY KEY ("guid")
);

-- CreateTable
CREATE TABLE "Settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_EventToPerson" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToPerson_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_EventToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_EventToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_EventToPerson_B_index" ON "_EventToPerson"("B");

-- CreateIndex
CREATE INDEX "_EventToTag_B_index" ON "_EventToTag"("B");

-- AddForeignKey
ALTER TABLE "_EventToPerson" ADD CONSTRAINT "_EventToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToPerson" ADD CONSTRAINT "_EventToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTag" ADD CONSTRAINT "_EventToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTag" ADD CONSTRAINT "_EventToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("name") ON DELETE CASCADE ON UPDATE CASCADE;
