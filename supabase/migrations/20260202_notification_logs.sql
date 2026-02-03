-- Migration: Create Notification Logs Table
-- Description: Stores audit logs for email and SMS notification attempts.

CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id BIGINT REFERENCES public.bookings(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'Email' or 'SMS'
    recipient TEXT NOT NULL,
    subject TEXT,
    content TEXT NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'Success', 'Failed', 'Retrying'
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_logs_booking_id ON public.notification_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_sent_at ON public.notification_logs(sent_at);

-- Enable RLS
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.notification_logs;
CREATE POLICY "Enable read access for all users" ON public.notification_logs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for service role" ON public.notification_logs;
CREATE POLICY "Enable insert for service role" ON public.notification_logs FOR INSERT WITH CHECK (true);
