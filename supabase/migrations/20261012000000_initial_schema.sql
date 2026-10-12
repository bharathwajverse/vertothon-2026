-- ==============================================================================
-- VERTOTHON 2026: Initial Core Database Schema & Row Level Security (RLS)
-- Target Platform: VERTOTHON 2026 Operations Platform by Vertofi
-- Revision: 2.0 (Security Audited - Recursion Safe, Strict Role Immutability)
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Custom Types & Enums
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'admin',
    'lead_organizer',
    'volunteer',
    'judge',
    'mentor',
    'participant'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE registration_status AS ENUM (
    'pending_review',
    'approved',
    'waitlisted',
    'rejected'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE submission_status AS ENUM (
    'draft',
    'submitted',
    'under_review',
    'scored'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE incident_status AS ENUM (
    'open',
    'investigating',
    'resolved'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE announcement_category AS ENUM (
    'urgent',
    'schedule',
    'general',
    'food'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ------------------------------------------------------------------------------
-- 2. Entities & Tables
-- ------------------------------------------------------------------------------

-- Table: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'participant',
  registration_status registration_status NOT NULL DEFAULT 'pending_review',
  github_handle TEXT,
  linkedin_url TEXT,
  college_or_company TEXT,
  t_shirt_size TEXT,
  dietary_restrictions TEXT,
  qr_checkin_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: teams
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  join_code TEXT NOT NULL UNIQUE,
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  track TEXT NOT NULL DEFAULT 'AI',
  project_title TEXT,
  max_capacity INT NOT NULL DEFAULT 4 CHECK (max_capacity BETWEEN 1 AND 4),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: team_members (M:N junction between profiles and teams)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_profile_per_team UNIQUE (profile_id) -- Participant can only be in one team
);

-- Table: submissions
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  project_title TEXT NOT NULL,
  summary TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  demo_url TEXT,
  video_url TEXT,
  track TEXT NOT NULL,
  tech_stack TEXT[] DEFAULT ARRAY[]::TEXT[],
  status submission_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: incidents (operational command center)
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity incident_severity NOT NULL DEFAULT 'medium',
  status incident_status NOT NULL DEFAULT 'open',
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Table: announcements (broadcast feed)
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category announcement_category NOT NULL DEFAULT 'general',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. Indexes for Query Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(registration_status);
CREATE INDEX IF NOT EXISTS idx_profiles_qr_token ON public.profiles(qr_checkin_token);
CREATE INDEX IF NOT EXISTS idx_teams_join_code ON public.teams(join_code);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_submissions_team ON public.submissions(team_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_announcements_created ON public.announcements(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. Trusted Security-Definer Helper Functions (Safe search_path & Grants)
-- ------------------------------------------------------------------------------

-- Helper to check if caller is an admin or organizer (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin_or_organizer()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'lead_organizer')
  );
END;
$$;

-- Helper to check if caller is assigned staff
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'lead_organizer', 'volunteer')
  );
END;
$$;

-- Helper to check if caller is a judge
CREATE OR REPLACE FUNCTION public.is_judge()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'judge'
  );
END;
$$;

-- Helper to get caller's current role without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  current_role user_role;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = user_id;
  RETURN current_role;
END;
$$;

-- Helper to get caller's current registration status without RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_status(user_id UUID)
RETURNS registration_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  current_status registration_status;
BEGIN
  SELECT registration_status INTO current_status FROM public.profiles WHERE id = user_id;
  RETURN current_status;
END;
$$;

-- Helper to check if caller is a member of a given team
CREATE OR REPLACE FUNCTION public.is_team_member(check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = check_team_id
      AND profile_id = auth.uid()
  );
END;
$$;

-- Helper to check if caller is the leader of a given team
CREATE OR REPLACE FUNCTION public.is_team_leader(check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = check_team_id
      AND leader_id = auth.uid()
  );
END;
$$;

-- Security Definer: Restrict EXECUTE to authenticated users and service_role
REVOKE EXECUTE ON FUNCTION public.is_admin_or_organizer() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin_or_organizer() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_judge() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_judge() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_user_status(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_status(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_team_member(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_team_member(UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_team_leader(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_team_leader(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 5. Immutability Triggers (Server-Side Enforced Role & Status Protection)
-- ------------------------------------------------------------------------------

-- Trigger function: Strictly prevent users from altering role or registration_status
CREATE OR REPLACE FUNCTION public.enforce_profile_role_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  -- If not an admin/organizer, reject any change to role or registration_status
  IF NOT public.is_admin_or_organizer() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Unauthorized: Ordinary users cannot alter their assigned role.';
    END IF;
    IF NEW.registration_status IS DISTINCT FROM OLD.registration_status THEN
      RAISE EXCEPTION 'Unauthorized: Registration approval status can only be modified by organizers.';
    END IF;
  END IF;

  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_profile_immutability ON public.profiles;
CREATE TRIGGER trg_enforce_profile_immutability
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_role_immutability();

-- Trigger: Automatically create public.profiles record when new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, registration_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.raw_user_meta_data->>'full_name', 'Attendee'),
    'participant', -- Strictly enforce participant role regardless of client metadata
    'pending_review'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger function: Enforce team member capacity constraint safely
CREATE OR REPLACE FUNCTION public.check_team_capacity_on_join()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  current_count INT;
  max_cap INT;
  applicant_status registration_status;
BEGIN
  -- Verify applicant is approved
  SELECT registration_status INTO applicant_status FROM public.profiles WHERE id = NEW.profile_id;
  IF applicant_status IS DISTINCT FROM 'approved' THEN
    RAISE EXCEPTION 'Cannot join a team until registration is approved by organizers.';
  END IF;

  -- Verify team capacity limit
  SELECT count(*) INTO current_count FROM public.team_members WHERE team_id = NEW.team_id;
  SELECT max_capacity INTO max_cap FROM public.teams WHERE id = NEW.team_id;

  IF current_count >= max_cap THEN
    RAISE EXCEPTION 'Team has reached its maximum member capacity (%).', max_cap;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_team_capacity ON public.team_members;
CREATE TRIGGER trg_check_team_capacity
  BEFORE INSERT ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.check_team_capacity_on_join();

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- ---- PROFILES POLICIES ----
-- SELECT: Authenticated users can view profile directories
CREATE POLICY "Profiles readable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- UPDATE: Users can update their own row (immutability trigger blocks role/status tampering)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ALL: Administrators have full management rights over profiles
CREATE POLICY "Staff can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_admin_or_organizer())
  WITH CHECK (public.is_admin_or_organizer());

-- ---- TEAMS POLICIES ----
-- SELECT: Authenticated users can view teams
CREATE POLICY "Teams viewable by authenticated users"
  ON public.teams FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: Approved participants or admins can create a team
CREATE POLICY "Approved participants can create team"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = leader_id
    AND public.get_user_status(auth.uid()) = 'approved'
  );

-- UPDATE: Team leaders or staff can update team details
CREATE POLICY "Leaders or staff can update team"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (leader_id = auth.uid() OR public.is_admin_or_organizer())
  WITH CHECK (leader_id = auth.uid() OR public.is_admin_or_organizer());

-- ---- TEAM_MEMBERS POLICIES ----
-- SELECT: Memberships are viewable by authenticated users
CREATE POLICY "Team memberships viewable"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (true);

-- INSERT: User can join a team (trigger verifies approved status and capacity)
CREATE POLICY "Users can join team"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    OR public.is_admin_or_organizer()
  );

-- DELETE: Team leaders can remove members, members can leave, or admins can moderate
CREATE POLICY "Members can leave or leader can remove"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (
    profile_id = auth.uid()
    OR public.is_team_leader(team_id)
    OR public.is_admin_or_organizer()
  );

-- ---- SUBMISSIONS POLICIES ----
-- SELECT: Submissions viewable by team members, judges, and admins
CREATE POLICY "Submissions viewable by members and staff"
  ON public.submissions FOR SELECT
  TO authenticated
  USING (
    public.is_team_member(team_id)
    OR public.is_admin_or_organizer()
    OR public.is_judge()
  );

-- INSERT/UPDATE: Team leaders can manage submission
CREATE POLICY "Team leaders can create submissions"
  ON public.submissions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_leader(team_id) OR public.is_admin_or_organizer());

CREATE POLICY "Team leaders can edit submissions"
  ON public.submissions FOR UPDATE
  TO authenticated
  USING (public.is_team_leader(team_id) OR public.is_admin_or_organizer())
  WITH CHECK (public.is_team_leader(team_id) OR public.is_admin_or_organizer());

-- ---- INCIDENTS POLICIES ----
-- SELECT/ALL: Operational incidents strictly restricted to staff
CREATE POLICY "Incidents viewable by staff"
  ON public.incidents FOR SELECT
  TO authenticated
  USING (public.is_staff());

CREATE POLICY "Incidents manageable by staff"
  ON public.incidents FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---- ANNOUNCEMENTS POLICIES ----
-- SELECT: Announcements readable by everyone (including anon visitors)
CREATE POLICY "Announcements readable by all"
  ON public.announcements FOR SELECT
  TO anon, authenticated
  USING (true);

-- ALL: Only staff can publish announcements
CREATE POLICY "Announcements manageable by staff"
  ON public.announcements FOR ALL
  TO authenticated
  USING (public.is_admin_or_organizer())
  WITH CHECK (public.is_admin_or_organizer());
