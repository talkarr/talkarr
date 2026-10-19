-- CreateTable
CREATE TABLE "Conference" (
    "acronym" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "aspect_ratio" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "schedule_url" TEXT NOT NULL,

    CONSTRAINT "Conference_pkey" PRIMARY KEY ("acronym")
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
CREATE TABLE "File" (
    "path" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "is_video" BOOLEAN NOT NULL,
    "eventGuid" TEXT NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("path")
);

-- CreateTable
CREATE TABLE "Event" (
    "guid" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "release_date" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "thumb_url" TEXT NOT NULL,
    "poster_url" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "frontend_link" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "conferenceAcronym" TEXT NOT NULL,
    "rootFolderPath" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("guid")
);

-- CreateTable
CREATE TABLE "EventInfo" (
    "guid" TEXT NOT NULL,
    "is_downloading" BOOLEAN NOT NULL,
    "download_progress" DOUBLE PRECISION NOT NULL,
    "download_error" TEXT,
    "download_exit_code" INTEGER,
    "eventGuid" TEXT NOT NULL,

    CONSTRAINT "EventInfo_pkey" PRIMARY KEY ("guid")
);

-- CreateTable
CREATE TABLE "RootFolder" (
    "path" TEXT NOT NULL
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
CREATE UNIQUE INDEX "Conference_title_key" ON "Conference"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Conference_slug_key" ON "Conference"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EventInfo_eventGuid_key" ON "EventInfo"("eventGuid");

-- CreateIndex
CREATE UNIQUE INDEX "RootFolder_path_key" ON "RootFolder"("path");

-- CreateIndex
CREATE INDEX "_EventToPerson_B_index" ON "_EventToPerson"("B");

-- CreateIndex
CREATE INDEX "_EventToTag_B_index" ON "_EventToTag"("B");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_eventGuid_fkey" FOREIGN KEY ("eventGuid") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_conferenceAcronym_fkey" FOREIGN KEY ("conferenceAcronym") REFERENCES "Conference"("acronym") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_rootFolderPath_fkey" FOREIGN KEY ("rootFolderPath") REFERENCES "RootFolder"("path") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInfo" ADD CONSTRAINT "EventInfo_eventGuid_fkey" FOREIGN KEY ("eventGuid") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToPerson" ADD CONSTRAINT "_EventToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToPerson" ADD CONSTRAINT "_EventToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "Person"("name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTag" ADD CONSTRAINT "_EventToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Event"("guid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventToTag" ADD CONSTRAINT "_EventToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("name") ON DELETE CASCADE ON UPDATE CASCADE;
