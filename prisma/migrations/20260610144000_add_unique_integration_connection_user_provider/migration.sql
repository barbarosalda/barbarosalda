-- CreateIndex
CREATE UNIQUE INDEX "integration_connections_user_provider_key" ON "integration_connections"("user_id", "provider_id");
