-- ==============================================================================
-- AZ Analytics: Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- This script provisions the complete database schema for AZ Analytics.
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query).
-- It enforces user isolation so users can strictly only access their own records.
-- ==============================================================================

-- 1. Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 2. Facebook Pages Table (Pages tracked or owned by the user)
CREATE TABLE IF NOT EXISTS public.facebook_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  category TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  profile_completeness INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 3. Page Audits Table
CREATE TABLE IF NOT EXISTS public.page_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.facebook_pages(id) ON DELETE SET NULL,
  page_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  overall_score INT NOT NULL,
  is_demo_data BOOLEAN DEFAULT FALSE,
  overview_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_quality_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  seo_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  engagement_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 4. Competitors Table
CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  competitor_name TEXT NOT NULL,
  competitor_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 5. Competitor Analyses Table
CREATE TABLE IF NOT EXISTS public.competitor_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  primary_page_url TEXT NOT NULL,
  competitor_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  comparison_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  key_insights JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_demo_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 6. Performance Reports Table
CREATE TABLE IF NOT EXISTS public.performance_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  page_name TEXT NOT NULL,
  page_url TEXT NOT NULL,
  date_range_label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  summary_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  engagement_trend JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_distribution JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_demo_data BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 7. Report Items Table (individual posts or findings inside a performance report)
CREATE TABLE IF NOT EXISTS public.report_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.performance_reports(id) ON DELETE CASCADE,
  post_type TEXT NOT NULL,
  caption_snippet TEXT,
  reactions INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  engagement_rate NUMERIC(5,2) DEFAULT 0.00,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- 8. User Settings Table
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  report_export_format TEXT DEFAULT 'PDF',
  preferred_theme TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- ==============================================================================
-- Indexes for Performance
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_facebook_pages_user_id ON public.facebook_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_page_audits_user_id ON public.page_audits(user_id);
CREATE INDEX IF NOT EXISTS idx_page_audits_created_at ON public.page_audits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_competitor_analyses_user_id ON public.competitor_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_reports_user_id ON public.performance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_report_items_report_id ON public.report_items(report_id);

-- ==============================================================================
-- Enable Row Level Security (RLS) on all tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facebook_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS Policies (Users can only read, insert, update, delete their own records)
-- ==============================================================================

-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Facebook Pages
CREATE POLICY "Users can manage own facebook pages" ON public.facebook_pages
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Page Audits
CREATE POLICY "Users can manage own page audits" ON public.page_audits
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Competitors
CREATE POLICY "Users can manage own competitors" ON public.competitors
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Competitor Analyses
CREATE POLICY "Users can manage own competitor analyses" ON public.competitor_analyses
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Performance Reports
CREATE POLICY "Users can manage own performance reports" ON public.performance_reports
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Report Items (via ownership of parent report)
CREATE POLICY "Users can manage own report items" ON public.report_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.performance_reports
      WHERE public.performance_reports.id = report_items.report_id
        AND public.performance_reports.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.performance_reports
      WHERE public.performance_reports.id = report_items.report_id
        AND public.performance_reports.user_id = auth.uid()
    )
  );

-- User Settings
CREATE POLICY "Users can manage own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- Automatic Profile Creation Trigger on Auth Sign-Up
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
