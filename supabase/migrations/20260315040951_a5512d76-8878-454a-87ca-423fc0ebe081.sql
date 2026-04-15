-- Scans table for persistent history
CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  score INTEGER NOT NULL,
  grade TEXT NOT NULL,
  hosting_type TEXT NOT NULL DEFAULT 'Apache',
  vulnerabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans"
  ON public.scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Global counters table for real-time stats
CREATE TABLE public.global_counters (
  id TEXT PRIMARY KEY,
  value BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.global_counters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Counters are publicly readable"
  ON public.global_counters FOR SELECT
  USING (true);

INSERT INTO public.global_counters (id, value) VALUES ('total_scans', 10247);

CREATE OR REPLACE FUNCTION public.increment_counter(counter_id TEXT, increment_by BIGINT DEFAULT 1)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_value BIGINT;
BEGIN
  UPDATE public.global_counters
  SET value = value + increment_by, updated_at = now()
  WHERE id = counter_id
  RETURNING value INTO new_value;
  RETURN new_value;
END;
$$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.global_counters;