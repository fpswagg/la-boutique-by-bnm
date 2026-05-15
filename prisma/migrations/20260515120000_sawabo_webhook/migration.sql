-- CreateTable
CREATE TABLE "SawaboSessionConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "sessionKey" TEXT NOT NULL,
    "botBaseUrl" TEXT NOT NULL,
    "webhookSecret" TEXT NOT NULL,
    "callbackUrl" TEXT,
    "callbackSecret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "maxRequestsPerHour" INTEGER NOT NULL DEFAULT 60,
    "defaultGroupIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allowedActions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SawaboSessionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SawaboWebhookRequest" (
    "id" BIGSERIAL NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "httpStatus" INTEGER,
    "execution" TEXT NOT NULL DEFAULT 'sync',
    "result" JSONB,
    "error" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "SawaboWebhookRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SawaboWebhookCallback" (
    "id" BIGSERIAL NOT NULL,
    "requestId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "signatureValid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SawaboWebhookCallback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SawaboExternalRequest" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "requestedBy" JSONB NOT NULL DEFAULT '{}',
    "payload" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "SawaboExternalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SawaboWebhookRequest_requestId_key" ON "SawaboWebhookRequest"("requestId");

-- CreateIndex
CREATE INDEX "SawaboWebhookRequest_action_idx" ON "SawaboWebhookRequest"("action");

-- CreateIndex
CREATE INDEX "SawaboWebhookRequest_status_idx" ON "SawaboWebhookRequest"("status");

-- CreateIndex
CREATE INDEX "SawaboWebhookRequest_createdAt_idx" ON "SawaboWebhookRequest"("createdAt");

-- CreateIndex
CREATE INDEX "SawaboWebhookCallback_requestId_idx" ON "SawaboWebhookCallback"("requestId");

-- CreateIndex
CREATE INDEX "SawaboWebhookCallback_createdAt_idx" ON "SawaboWebhookCallback"("createdAt");

-- CreateIndex
CREATE INDEX "SawaboExternalRequest_status_idx" ON "SawaboExternalRequest"("status");

-- CreateIndex
CREATE INDEX "SawaboExternalRequest_requestedAt_idx" ON "SawaboExternalRequest"("requestedAt");

-- AddForeignKey
ALTER TABLE "SawaboWebhookCallback" ADD CONSTRAINT "SawaboWebhookCallback_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "SawaboWebhookRequest"("requestId") ON DELETE CASCADE ON UPDATE CASCADE;
