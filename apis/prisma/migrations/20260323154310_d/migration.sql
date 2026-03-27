-- CreateTable
CREATE TABLE "AppEntity" (
    "collection" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppEntity_pkey" PRIMARY KEY ("collection","entityId")
);

-- CreateIndex
CREATE INDEX "AppEntity_collection_idx" ON "AppEntity"("collection");
