-- Add 'completed' status to loan_status enum
ALTER TYPE public.loan_status
ADD VALUE 'completed'
AFTER 'disbursed';