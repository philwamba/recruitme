ALTER TABLE "User"
ADD COLUMN "linkedinId" TEXT;

CREATE UNIQUE INDEX "User_linkedinId_key" ON "User"("linkedinId");
