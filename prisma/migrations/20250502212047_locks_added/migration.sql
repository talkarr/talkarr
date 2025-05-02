-- CreateTable
CREATE TABLE "Locks" (
    "name" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Locks_pkey" PRIMARY KEY ("name")
);
