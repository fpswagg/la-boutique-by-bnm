-- DropForeignKey
ALTER TABLE "SawaboWebhookCallback" DROP CONSTRAINT IF EXISTS "SawaboWebhookCallback_requestId_fkey";

-- DropTable
DROP TABLE IF EXISTS "SawaboWebhookCallback";

-- DropTable
DROP TABLE IF EXISTS "SawaboWebhookRequest";

-- DropTable
DROP TABLE IF EXISTS "SawaboExternalRequest";

-- DropTable
DROP TABLE IF EXISTS "SawaboSessionConfig";
