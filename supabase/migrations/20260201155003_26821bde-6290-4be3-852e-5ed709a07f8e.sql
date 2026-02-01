-- Create enum for loan status
CREATE TYPE public.loan_status AS ENUM ('pending', 'approved', 'rejected', 'disbursed');

-- Create loan_requests table
CREATE TABLE public.loan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  purpose TEXT,
  status loan_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (no auth required for applying)
CREATE POLICY "Anyone can apply for loan"
ON public.loan_requests
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read (admin will filter by email check in UI)
CREATE POLICY "Anyone can view loan requests"
ON public.loan_requests
FOR SELECT
USING (true);

-- Allow updates (for admin status changes)
CREATE POLICY "Anyone can update loan requests"
ON public.loan_requests
FOR UPDATE
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_loan_requests_updated_at
BEFORE UPDATE ON public.loan_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for loan_requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.loan_requests;