-- SSOT Phase 2: Per-follow event alert settings
-- Source of truth: docs/FEED_ALERTS_SPEC.md
--
-- Defaults:
-- - Member alerts OFF by default (user opts in for specific followed traders)
--
-- This migration extends follow_notification_settings to include position event alerts.

ALTER TABLE public.follow_notification_settings
  ADD COLUMN IF NOT EXISTS position_opened BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS position_closed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS position_stop_hit BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS position_target_hit BOOLEAN NOT NULL DEFAULT false;

