-- Run this in your Supabase SQL Editor

-- 1. Users Table
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    graduation_year INTEGER,
    is_approved BOOLEAN DEFAULT true,
    needs_password_change BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alternatively, existing databases can run:
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;
-- ALTER TABLE public.users ADD COLUMN IF NOT EXISTS needs_password_change BOOLEAN DEFAULT false;

-- 2. Opportunities Table
CREATE TABLE public.opportunities (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    mode TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements JSONB DEFAULT '[]'::jsonb,
    deadline DATE,
    created_by_user_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    created_by_role TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Recommendations Table
CREATE TABLE public.recommendations (
    id SERIAL PRIMARY KEY,
    instructor_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES public.users(id) ON DELETE CASCADE,
    opportunity_id INTEGER REFERENCES public.opportunities(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Audit Logs Table
CREATE TABLE public.audit_logs (
    id SERIAL PRIMARY KEY,
    actor_user_id INTEGER NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
