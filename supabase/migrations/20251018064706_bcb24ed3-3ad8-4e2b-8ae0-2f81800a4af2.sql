-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule daily material rankings update at 2 AM UTC
SELECT cron.schedule(
  'update-material-rankings-daily',
  '0 2 * * *', -- Run at 2 AM UTC every day
  $$
  SELECT
    net.http_post(
        url:='https://rwinelghzsuetpgrzwph.supabase.co/functions/v1/update-material-rankings',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3aW5lbGdoenN1ZXRwZ3J6d3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1OTk0NDksImV4cCI6MjA3NjE3NTQ0OX0.ee0gRTPd8CkZEaHbZg1zFS9ui-paU1uIEtQXeJTKDJo"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);