-- SSOT Newsletter reliability hardening
-- Source of truth: docs/NEWSLETTER_SPEC.md §9
--
-- Ensure we can enforce idempotent campaign sends:
-- one send per (campaign_id, subscriber_id)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'newsletter_sends_campaign_subscriber_unique'
  ) THEN
    ALTER TABLE public.newsletter_sends
      ADD CONSTRAINT newsletter_sends_campaign_subscriber_unique
      UNIQUE (campaign_id, subscriber_id);
  END IF;
END $$;

