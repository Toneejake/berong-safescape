-- CreateTable
CREATE TABLE "floor_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "gridData" JSONB NOT NULL,
    "thumbnail" TEXT,
    "originalImage" TEXT,
    "userId" INTEGER NOT NULL,
    "uploaderName" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "clonedFromId" INTEGER,
    "gridWidth" INTEGER NOT NULL DEFAULT 256,
    "gridHeight" INTEGER NOT NULL DEFAULT 256,
    "exitCount" INTEGER NOT NULL DEFAULT 0,
    "processingMethod" TEXT NOT NULL DEFAULT 'unet',
    "threshold" DOUBLE PRECISION,
    "invertMask" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "floor_plans_userId_idx" ON "floor_plans"("userId");

-- CreateIndex
CREATE INDEX "floor_plans_isPublic_idx" ON "floor_plans"("isPublic");

-- CreateIndex
CREATE INDEX "floor_plans_clonedFromId_idx" ON "floor_plans"("clonedFromId");

-- AddForeignKey
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_clonedFromId_fkey" FOREIGN KEY ("clonedFromId") REFERENCES "floor_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floor_plans" ADD CONSTRAINT "floor_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
