-- Add PAN and Aadhaar columns to loan_requests
ALTER TABLE public.loan_requests 
ADD COLUMN pan_number TEXT,
ADD COLUMN aadhaar_number TEXT;