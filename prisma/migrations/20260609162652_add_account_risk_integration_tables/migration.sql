-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PropFirmType" AS ENUM ('CFD', 'FUTURES', 'MULTI_ASSET', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TradingMarketType" AS ENUM ('FOREX_CFD', 'FUTURES', 'CRYPTO', 'MULTI_ASSET', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TradingAccountStatus" AS ENUM ('ACTIVE', 'DISCONNECTED', 'LOCKED', 'BREACHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SnapshotType" AS ENUM ('EVENT', 'MANUAL');

-- CreateEnum
CREATE TYPE "RuleGroupType" AS ENUM ('SYSTEM', 'PROP_FIRM', 'ACCOUNT', 'USER_CUSTOM');

-- CreateEnum
CREATE TYPE "RuleSetType" AS ENUM ('PROP_FIRM_OFFICIAL', 'TRADERLOCK_SYSTEM', 'INFORMATION_RESTRICTION', 'USER_CUSTOM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('PROFIT_TARGET', 'MIN_TRADING_DAYS', 'MIN_PROFITABLE_DAYS', 'MIN_TRADES', 'MAX_TRADES', 'TIME_LIMIT', 'ACCESS_PERIOD', 'MAX_DAILY_LOSS', 'MAX_TOTAL_LOSS', 'STATIC_DRAWDOWN', 'TRAILING_DRAWDOWN', 'EOD_DRAWDOWN', 'INTRADAY_DRAWDOWN', 'MAX_OPEN_LOSS', 'MAX_OPEN_RISK', 'DAILY_PAUSE_LIMIT', 'MAX_POSITION_SIZE', 'MAX_CONTRACTS', 'MAX_LOTS', 'MAX_OPEN_POSITIONS', 'MAX_SYMBOL_EXPOSURE', 'MAX_TOTAL_EXPOSURE', 'RISK_PER_TRADE_LIMIT', 'LEVERAGE_LIMIT', 'MARGIN_USAGE_LIMIT', 'SCALING_PLAN', 'TRADING_HOURS_RESTRICTION', 'MARKET_CLOSE_RESTRICTION', 'OVERNIGHT_RESTRICTION', 'WEEKEND_RESTRICTION', 'HOLIDAY_RESTRICTION', 'SESSION_RESTRICTION', 'MAX_HOLD_TIME', 'MIN_HOLD_TIME', 'NEWS_RESTRICTION', 'NEWS_PROFIT_ADJUSTMENT', 'NEWS_PENDING_ORDER_RESTRICTION', 'HIGH_IMPACT_EVENT_RESTRICTION', 'SPEECH_EVENT_RESTRICTION', 'EARNINGS_RESTRICTION', 'CONSISTENCY_RULE', 'BEST_DAY_LIMIT', 'BEST_TRADE_LIMIT', 'LOT_SIZE_CONSISTENCY', 'TRADE_FREQUENCY_CONSISTENCY', 'GAMBLING_BEHAVIOR_RESTRICTION', 'MARTINGALE_RESTRICTION', 'ONE_SIDED_BET_RESTRICTION', 'COPY_TRADING_RESTRICTION', 'GROUP_TRADING_RESTRICTION', 'HFT_RESTRICTION', 'LATENCY_ARBITRAGE_RESTRICTION', 'HEDGING_RESTRICTION', 'REVERSE_TRADING_RESTRICTION', 'PERMITTED_MARKETS', 'RESTRICTED_MARKETS', 'SYMBOL_RESTRICTION', 'ASSET_CLASS_RESTRICTION', 'PLATFORM_RESTRICTION', 'PAYOUT_ELIGIBILITY', 'PAYOUT_MIN_PROFIT', 'PAYOUT_MIN_TRADING_DAYS', 'PAYOUT_CONSISTENCY_RULE', 'PAYOUT_CAP', 'PAYOUT_FREQUENCY_LIMIT', 'PAYOUT_SPLIT_RULE', 'PAYOUT_CYCLE_RULE', 'PAYOUT_RESET_RULE', 'INACTIVITY_RULE', 'ACCOUNT_EXPIRATION_RULE', 'MAX_ACCOUNTS_LIMIT', 'MAX_CAPITAL_ALLOCATION', 'KYC_REQUIREMENT', 'SCALING_ELIGIBILITY', 'RESET_ELIGIBILITY', 'PROHIBITED_STRATEGY', 'TERMS_VIOLATION', 'MANUAL_REVIEW_TRIGGER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RuleSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RuleStateStatus" AS ENUM ('NOT_EVALUATED', 'COMPLIANT', 'WARNING', 'BREACHED', 'DISABLED');

-- CreateEnum
CREATE TYPE "IntegrationProviderType" AS ENUM ('TRADING_PLATFORM', 'MARKET_DATA_PROVIDER', 'NEWS_PROVIDER', 'NOTIFICATION_PROVIDER', 'OTHER');

-- CreateEnum
CREATE TYPE "IntegrationAuthType" AS ENUM ('OAUTH', 'API_KEY', 'USERNAME_PASSWORD', 'NONE', 'SYSTEM_MANAGED');

-- CreateEnum
CREATE TYPE "IntegrationConnectionMode" AS ENUM ('REST', 'WEBSOCKET', 'HYBRID', 'MANUAL', 'INTERNAL');

-- CreateEnum
CREATE TYPE "IntegrationConnectionStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'REVOKED', 'ERROR', 'DISCONNECTED');

-- CreateTable
CREATE TABLE "prop_firms" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website_url" TEXT,
    "status" "RecordStatus",
    "firm_type" "PropFirmType",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prop_firms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firm_programs" (
    "id" TEXT NOT NULL,
    "prop_firm_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "initial_nominal_value" DOUBLE PRECISION,
    "market_type" "TradingMarketType",
    "status" "RecordStatus",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prop_firm_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prop_firm_program_stages" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequence_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prop_firm_program_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_groups" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "group_type" "RuleGroupType" NOT NULL DEFAULT 'ACCOUNT',
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_sets" (
    "id" TEXT NOT NULL,
    "rule_group_id" TEXT NOT NULL,
    "prop_firm_id" TEXT,
    "prop_firm_program_id" TEXT,
    "prop_firm_program_stage_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "set_type" "RuleSetType" NOT NULL DEFAULT 'CUSTOM',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "source_url" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" TEXT NOT NULL,
    "rule_set_id" TEXT NOT NULL,
    "rule_type" "RuleType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "severity" "RuleSeverity" NOT NULL DEFAULT 'MEDIUM',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "params_json" JSONB NOT NULL,
    "source_url" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "license_id" TEXT,
    "provider_account_id" TEXT,
    "account_number" TEXT,
    "account_label" TEXT,
    "account_currency" TEXT,
    "prop_firm_id" TEXT,
    "prop_firm_program_id" TEXT,
    "prop_firm_program_stage_id" TEXT,
    "rule_group_id" TEXT,
    "status" "TradingAccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trading_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trading_account_snapshots" (
    "id" TEXT NOT NULL,
    "trading_account_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION,
    "equity" DOUBLE PRECISION,
    "margin_used" DOUBLE PRECISION,
    "free_margin" DOUBLE PRECISION,
    "unrealized_pnl" DOUBLE PRECISION,
    "realized_pnl" DOUBLE PRECISION,
    "snapshot_type" "SnapshotType" NOT NULL DEFAULT 'EVENT',
    "provider_timestamp" TIMESTAMP(3),
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trading_account_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rule_states" (
    "id" TEXT NOT NULL,
    "trading_account_id" TEXT NOT NULL,
    "rule_id" TEXT NOT NULL,
    "status" "RuleStateStatus" NOT NULL DEFAULT 'NOT_EVALUATED',
    "state_json" JSONB,
    "window_start_at" TIMESTAMP(3),
    "window_end_at" TIMESTAMP(3),
    "last_evaluated_event_id" TEXT,
    "last_evaluated_at" TIMESTAMP(3),
    "next_evaluation_at" TIMESTAMP(3),
    "status_changed_at" TIMESTAMP(3),
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rule_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_providers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "provider_type" "IntegrationProviderType" NOT NULL DEFAULT 'OTHER',
    "auth_type" "IntegrationAuthType" NOT NULL,
    "connection_mode" "IntegrationConnectionMode" NOT NULL,
    "adapter_key" TEXT NOT NULL,
    "website_url" TEXT,
    "logo_url" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "provider_external_user_id" TEXT,
    "status" "IntegrationConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "credentials_ref" TEXT,
    "connected_at" TIMESTAMP(3),
    "disconnected_at" TIMESTAMP(3),
    "last_sync_at" TIMESTAMP(3),
    "last_error" TEXT,
    "metadata_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prop_firms_slug_key" ON "prop_firms"("slug");

-- CreateIndex
CREATE INDEX "prop_firms_status_idx" ON "prop_firms"("status");

-- CreateIndex
CREATE INDEX "prop_firms_firm_type_idx" ON "prop_firms"("firm_type");

-- CreateIndex
CREATE INDEX "prop_firm_programs_prop_firm_id_idx" ON "prop_firm_programs"("prop_firm_id");

-- CreateIndex
CREATE INDEX "prop_firm_programs_market_type_idx" ON "prop_firm_programs"("market_type");

-- CreateIndex
CREATE INDEX "prop_firm_programs_status_idx" ON "prop_firm_programs"("status");

-- CreateIndex
CREATE INDEX "prop_firm_program_stages_program_id_idx" ON "prop_firm_program_stages"("program_id");

-- CreateIndex
CREATE UNIQUE INDEX "prop_firm_program_stages_program_id_sequence_order_key" ON "prop_firm_program_stages"("program_id", "sequence_order");

-- CreateIndex
CREATE INDEX "rule_groups_user_id_idx" ON "rule_groups"("user_id");

-- CreateIndex
CREATE INDEX "rule_groups_group_type_idx" ON "rule_groups"("group_type");

-- CreateIndex
CREATE INDEX "rule_groups_status_idx" ON "rule_groups"("status");

-- CreateIndex
CREATE INDEX "rule_sets_rule_group_id_idx" ON "rule_sets"("rule_group_id");

-- CreateIndex
CREATE INDEX "rule_sets_prop_firm_id_idx" ON "rule_sets"("prop_firm_id");

-- CreateIndex
CREATE INDEX "rule_sets_prop_firm_program_id_idx" ON "rule_sets"("prop_firm_program_id");

-- CreateIndex
CREATE INDEX "rule_sets_prop_firm_program_stage_id_idx" ON "rule_sets"("prop_firm_program_stage_id");

-- CreateIndex
CREATE INDEX "rule_sets_set_type_idx" ON "rule_sets"("set_type");

-- CreateIndex
CREATE INDEX "rule_sets_status_idx" ON "rule_sets"("status");

-- CreateIndex
CREATE INDEX "rules_rule_set_id_idx" ON "rules"("rule_set_id");

-- CreateIndex
CREATE INDEX "rules_rule_type_idx" ON "rules"("rule_type");

-- CreateIndex
CREATE INDEX "rules_severity_idx" ON "rules"("severity");

-- CreateIndex
CREATE INDEX "rules_status_idx" ON "rules"("status");

-- CreateIndex
CREATE INDEX "trading_accounts_user_id_idx" ON "trading_accounts"("user_id");

-- CreateIndex
CREATE INDEX "trading_accounts_license_id_idx" ON "trading_accounts"("license_id");

-- CreateIndex
CREATE INDEX "trading_accounts_provider_account_id_idx" ON "trading_accounts"("provider_account_id");

-- CreateIndex
CREATE INDEX "trading_accounts_prop_firm_id_idx" ON "trading_accounts"("prop_firm_id");

-- CreateIndex
CREATE INDEX "trading_accounts_prop_firm_program_id_idx" ON "trading_accounts"("prop_firm_program_id");

-- CreateIndex
CREATE INDEX "trading_accounts_prop_firm_program_stage_id_idx" ON "trading_accounts"("prop_firm_program_stage_id");

-- CreateIndex
CREATE INDEX "trading_accounts_rule_group_id_idx" ON "trading_accounts"("rule_group_id");

-- CreateIndex
CREATE INDEX "trading_accounts_status_idx" ON "trading_accounts"("status");

-- CreateIndex
CREATE INDEX "trading_account_snapshots_trading_account_id_recorded_at_idx" ON "trading_account_snapshots"("trading_account_id", "recorded_at");

-- CreateIndex
CREATE INDEX "trading_account_snapshots_snapshot_type_idx" ON "trading_account_snapshots"("snapshot_type");

-- CreateIndex
CREATE INDEX "rule_states_rule_id_idx" ON "rule_states"("rule_id");

-- CreateIndex
CREATE INDEX "rule_states_status_idx" ON "rule_states"("status");

-- CreateIndex
CREATE INDEX "rule_states_next_evaluation_at_idx" ON "rule_states"("next_evaluation_at");

-- CreateIndex
CREATE UNIQUE INDEX "rule_states_trading_account_id_rule_id_key" ON "rule_states"("trading_account_id", "rule_id");

-- CreateIndex
CREATE UNIQUE INDEX "integration_providers_code_key" ON "integration_providers"("code");

-- CreateIndex
CREATE INDEX "integration_providers_provider_type_idx" ON "integration_providers"("provider_type");

-- CreateIndex
CREATE INDEX "integration_providers_status_idx" ON "integration_providers"("status");

-- CreateIndex
CREATE INDEX "integration_providers_adapter_key_idx" ON "integration_providers"("adapter_key");

-- CreateIndex
CREATE INDEX "integration_connections_user_id_idx" ON "integration_connections"("user_id");

-- CreateIndex
CREATE INDEX "integration_connections_provider_id_idx" ON "integration_connections"("provider_id");

-- CreateIndex
CREATE INDEX "integration_connections_status_idx" ON "integration_connections"("status");

-- AddForeignKey
ALTER TABLE "prop_firm_programs" ADD CONSTRAINT "prop_firm_programs_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prop_firm_program_stages" ADD CONSTRAINT "prop_firm_program_stages_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "prop_firm_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_rule_group_id_fkey" FOREIGN KEY ("rule_group_id") REFERENCES "rule_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_prop_firm_program_id_fkey" FOREIGN KEY ("prop_firm_program_id") REFERENCES "prop_firm_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_sets" ADD CONSTRAINT "rule_sets_prop_firm_program_stage_id_fkey" FOREIGN KEY ("prop_firm_program_stage_id") REFERENCES "prop_firm_program_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rules" ADD CONSTRAINT "rules_rule_set_id_fkey" FOREIGN KEY ("rule_set_id") REFERENCES "rule_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_prop_firm_id_fkey" FOREIGN KEY ("prop_firm_id") REFERENCES "prop_firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_prop_firm_program_id_fkey" FOREIGN KEY ("prop_firm_program_id") REFERENCES "prop_firm_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_prop_firm_program_stage_id_fkey" FOREIGN KEY ("prop_firm_program_stage_id") REFERENCES "prop_firm_program_stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_accounts" ADD CONSTRAINT "trading_accounts_rule_group_id_fkey" FOREIGN KEY ("rule_group_id") REFERENCES "rule_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trading_account_snapshots" ADD CONSTRAINT "trading_account_snapshots_trading_account_id_fkey" FOREIGN KEY ("trading_account_id") REFERENCES "trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_states" ADD CONSTRAINT "rule_states_trading_account_id_fkey" FOREIGN KEY ("trading_account_id") REFERENCES "trading_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rule_states" ADD CONSTRAINT "rule_states_rule_id_fkey" FOREIGN KEY ("rule_id") REFERENCES "rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "integration_providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
