-- CreateTable
CREATE TABLE "OIDCSettings" (
    "id" SERIAL NOT NULL,
    "wellKnownUrl" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OIDCSettings_pkey" PRIMARY KEY ("id")
);
