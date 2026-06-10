-- CreateTable
CREATE TABLE "prop_firm_program_supported_platforms" (
    "prop_firm_program_id" TEXT NOT NULL,
    "integration_provider_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pfp_supported_platforms_pkey" PRIMARY KEY ("prop_firm_program_id","integration_provider_id")
);

-- CreateIndex
CREATE INDEX "pfp_supported_platforms_provider_id_idx" ON "prop_firm_program_supported_platforms"("integration_provider_id");

-- AddForeignKey
ALTER TABLE "prop_firm_program_supported_platforms" ADD CONSTRAINT "pfp_supported_platforms_program_id_fkey" FOREIGN KEY ("prop_firm_program_id") REFERENCES "prop_firm_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prop_firm_program_supported_platforms" ADD CONSTRAINT "pfp_supported_platforms_provider_id_fkey" FOREIGN KEY ("integration_provider_id") REFERENCES "integration_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
