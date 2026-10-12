-- ==============================================================================
-- VERTOTHON 2026: Batch 2 Operations Expansion & Database Schema Hardening
-- Migration: 20261012010000_event_operations_expansion.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Strict Profile Privacy RLS & Public Profiles View
-- ------------------------------------------------------------------------------

-- Drop overly-broad profile SELECT policy
DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public.profiles;

-- 1a. Users can read their own full profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 1b. Staff (admins, lead organizers, volunteers) can read all profiles
CREATE POLICY "Staff can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_staff());

-- 1c. Team members can read teammates' profiles
CREATE POLICY "Teammates can read teammate profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm1
      JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
      WHERE tm1.profile_id = auth.uid()
        AND tm2.profile_id = public.profiles.id
    )
  );

-- Add directory, profile, and checkin columns if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dietary_requirements TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}'::TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Helper public view exposing only non-sensitive directory fields to all users
-- Excludes private details: email, phone, dietary_requirements, t_shirt_size, qr_checkin_token
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  full_name,
  role,
  college_or_company,
  github_handle,
  github_handle AS github_profile,
  avatar_url,
  skills,
  linkedin_url,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- ------------------------------------------------------------------------------
-- 2. Event Configuration & Settings (event_settings)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.event_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL DEFAULT 'VERTOTHON 2026',
  short_description TEXT NOT NULL DEFAULT 'India''s Flagship 36-Hour Offline Hackathon by Vertofi',
  long_description TEXT NOT NULL DEFAULT 'VERTOTHON 2026 convenes 1,000+ elite engineers, builders, and designers for a 36-hour offline hackathon sprint focused on AI, Web3, FinTech, and frontier tech.',
  organizer_name TEXT NOT NULL DEFAULT 'Vertofi',
  contact_email TEXT NOT NULL DEFAULT 'contact@vertofi.com',
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  start_time TIMESTAMPTZ NOT NULL DEFAULT '2026-11-14T08:00:00+05:30',
  end_time TIMESTAMPTZ NOT NULL DEFAULT '2026-11-15T20:00:00+05:30',
  registration_deadline TIMESTAMPTZ NOT NULL DEFAULT '2026-11-10T23:59:59+05:30',
  submission_deadline TIMESTAMPTZ NOT NULL DEFAULT '2026-11-15T12:00:00+05:30',
  venue TEXT NOT NULL DEFAULT 'Hyderabad, India',
  is_venue_confirmed BOOLEAN NOT NULL DEFAULT false,
  capacity_limit INT NOT NULL DEFAULT 1000 CHECK (capacity_limit > 0),
  min_team_size INT NOT NULL DEFAULT 1 CHECK (min_team_size >= 1),
  max_team_size INT NOT NULL DEFAULT 4 CHECK (max_team_size >= min_team_size),
  payment_enabled BOOLEAN NOT NULL DEFAULT false,
  results_published BOOLEAN NOT NULL DEFAULT false,
  judging_rubric JSONB NOT NULL DEFAULT '[
    {"id": "innovation", "label": "Innovation & Originality", "maxScore": 10, "weight": 0.25, "description": "Novelty of approach and creativity of solution."},
    {"id": "technical", "label": "Technical Complexity", "maxScore": 10, "weight": 0.25, "description": "Code quality, architecture, technical challenge, and execution integrity."},
    {"id": "design", "label": "UI/UX & Design", "maxScore": 10, "weight": 0.20, "description": "User experience, visual polish, and intuitive workflows."},
    {"id": "viability", "label": "Viability & Impact", "maxScore": 10, "weight": 0.15, "description": "Real-world utility, market adoption potential, and scalability."},
    {"id": "presentation", "label": "Presentation & Pitch", "maxScore": 10, "weight": 0.15, "description": "Clarity of demonstration, documentation, and communication."}
  ]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.event_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Event settings readable by all"
  ON public.event_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Event settings updatable by organizers"
  ON public.event_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_organizer())
  WITH CHECK (public.is_admin_or_organizer());

CREATE POLICY "Event settings insertable by organizers"
  ON public.event_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_organizer());

-- Seed initial event settings row if not present
INSERT INTO public.event_settings (
  id, event_name, short_description, long_description,
  organizer_name, contact_email, timezone,
  start_time, end_time, registration_deadline, submission_deadline,
  venue, is_venue_confirmed, capacity_limit, min_team_size, max_team_size,
  payment_enabled, results_published
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'VERTOTHON 2026',
  'India''s Flagship 36-Hour Offline Hackathon by Vertofi',
  'VERTOTHON 2026 convenes 1,000+ elite engineers, builders, and designers for a 36-hour offline hackathon sprint focused on AI, Web3, FinTech, and frontier tech.',
  'Vertofi',
  'contact@vertofi.com',
  'Asia/Kolkata',
  '2026-11-14T08:00:00+05:30',
  '2026-11-15T20:00:00+05:30',
  '2026-11-10T23:59:59+05:30',
  '2026-11-15T12:00:00+05:30',
  'Hyderabad, India',
  false,
  1000,
  1,
  4,
  false,
  false
) ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Database-Backed Schedule (schedule_items)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('ceremony', 'hacking', 'food', 'mentoring', 'judging')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.schedule_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published schedule readable by all"
  ON public.schedule_items FOR SELECT
  TO anon, authenticated
  USING (is_published = true OR public.is_staff());

CREATE POLICY "Schedule items manageable by organizers"
  ON public.schedule_items FOR ALL
  TO authenticated
  USING (public.is_admin_or_organizer())
  WITH CHECK (public.is_admin_or_organizer());

-- Seed initial schedule items
INSERT INTO public.schedule_items (id, title, description, start_time, end_time, location, category, is_published, sort_order) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Participant Check-in & Badge Issuance', 'Onsite QR badge verification, kit distribution, and ID checks.', '2026-11-14T08:00:00+05:30', '2026-11-14T09:30:00+05:30', 'Main Foyer Desk', 'ceremony', true, 1),
  ('10000000-0000-0000-0000-000000000002', 'Opening Ceremony & Keynote by Vertofi', 'Hackathon kickoff, challenge briefing, and judging rubric overview.', '2026-11-14T09:30:00+05:30', '2026-11-14T10:30:00+05:30', 'Auditorium 1', 'ceremony', true, 2),
  ('10000000-0000-0000-0000-000000000003', 'Hacking Officially Begins', '36-hour build sprint begins across AI, Web3, FinTech, HealthTech, and Open Innovation.', '2026-11-14T11:00:00+05:30', NULL, 'Hacking Arena A & B', 'hacking', true, 3),
  ('10000000-0000-0000-0000-000000000004', 'Networking Lunch', 'Buffet lunch catering for all verified participants and mentors.', '2026-11-14T13:00:00+05:30', '2026-11-14T14:00:00+05:30', 'Dining Hall', 'food', true, 4),
  ('10000000-0000-0000-0000-000000000005', 'Mentor Round 1: Architecture Reviews', 'Technical guidance from Vertofi engineers and industry mentors.', '2026-11-14T16:00:00+05:30', '2026-11-14T19:00:00+05:30', 'Mentor Lounges', 'mentoring', true, 5),
  ('10000000-0000-0000-0000-000000000006', 'Dinner & Mid-Hack Checkpoint', 'Dinner break, lightning trivia, and energy drinks refresh.', '2026-11-14T20:00:00+05:30', '2026-11-14T21:30:00+05:30', 'Dining Hall', 'food', true, 6),
  ('10000000-0000-0000-0000-000000000007', 'Breakfast & Coffee Station', 'Breakfast service and morning standup for teams.', '2026-11-15T08:00:00+05:30', '2026-11-15T09:00:00+05:30', 'Dining Hall', 'food', true, 7),
  ('10000000-0000-0000-0000-000000000008', 'Code Freeze & Project Submissions Deadline', 'All repository URLs and demos must be submitted. Submissions lock automatically at 12:00 PM IST.', '2026-11-15T12:00:00+05:30', NULL, 'Submissions Portal', 'hacking', true, 8),
  ('10000000-0000-0000-0000-000000000009', 'Live Pitching & Judge Evaluations', 'Finalist demonstrations and 5-criteria rubric evaluation by the jury panel.', '2026-11-15T13:30:00+05:30', '2026-11-15T16:30:00+05:30', 'Presentation Stages 1-3', 'judging', true, 9),
  ('10000000-0000-0000-0000-000000000010', 'Grand Valedictory & Prize Distribution', 'Announcement of category winners, track prizes, and closing remarks.', '2026-11-15T17:30:00+05:30', '2026-11-15T19:30:00+05:30', 'Auditorium 1', 'ceremony', true, 10)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Database-Backed Judging & Evaluations (judge_assignments, evaluations)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.judge_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_judge_submission_assignment UNIQUE (judge_id, submission_id)
);

CREATE TABLE IF NOT EXISTS public.evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_score NUMERIC NOT NULL DEFAULT 0 CHECK (total_score >= 0),
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_judge_submission_eval UNIQUE (judge_id, submission_id)
);

ALTER TABLE public.judge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Judge assignments policies
CREATE POLICY "Judges or staff view assignments"
  ON public.judge_assignments FOR SELECT
  TO authenticated
  USING (judge_id = auth.uid() OR public.is_admin_or_organizer());

CREATE POLICY "Staff manage judge assignments"
  ON public.judge_assignments FOR ALL
  TO authenticated
  USING (public.is_admin_or_organizer())
  WITH CHECK (public.is_admin_or_organizer());

-- Evaluations policies:
-- Judges can only view/upsert their OWN assigned evaluations. Organizers/Admins can read all.
-- Participants CANNOT read evaluations or unpublished scores.
CREATE POLICY "Judges view own evaluations or staff view all"
  ON public.evaluations FOR SELECT
  TO authenticated
  USING (judge_id = auth.uid() OR public.is_admin_or_organizer());

CREATE POLICY "Judges insert own evaluations"
  ON public.evaluations FOR INSERT
  TO authenticated
  WITH CHECK (judge_id = auth.uid() OR public.is_admin_or_organizer());

CREATE POLICY "Judges update own evaluations"
  ON public.evaluations FOR UPDATE
  TO authenticated
  USING (judge_id = auth.uid() OR public.is_admin_or_organizer())
  WITH CHECK (judge_id = auth.uid() OR public.is_admin_or_organizer());

CREATE POLICY "Organizers delete evaluations"
  ON public.evaluations FOR DELETE
  TO authenticated
  USING (public.is_admin_or_organizer());

-- ------------------------------------------------------------------------------
-- 5. Mentor Requests (mentor_requests)
-- ------------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE mentor_request_status AS ENUM (
    'open',
    'assigned',
    'in_progress',
    'resolved'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.mentor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT NOT NULL,
  status mentor_request_status NOT NULL DEFAULT 'open',
  assigned_mentor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE public.mentor_requests ENABLE ROW LEVEL SECURITY;

-- Helper to check if caller is mentor or staff
CREATE OR REPLACE FUNCTION public.is_mentor()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('mentor', 'admin', 'lead_organizer', 'volunteer')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.is_mentor() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_mentor() TO authenticated, service_role;

-- Policies:
-- Team members can read their own team's requests; Mentors and staff can view all.
CREATE POLICY "Team members or mentors view requests"
  ON public.mentor_requests FOR SELECT
  TO authenticated
  USING (public.is_team_member(team_id) OR public.is_mentor());

CREATE POLICY "Team members create requests"
  ON public.mentor_requests FOR INSERT
  TO authenticated
  WITH CHECK (public.is_team_member(team_id) AND requester_id = auth.uid());

CREATE POLICY "Mentors or team members update requests"
  ON public.mentor_requests FOR UPDATE
  TO authenticated
  USING (public.is_team_member(team_id) OR public.is_mentor())
  WITH CHECK (public.is_team_member(team_id) OR public.is_mentor());

-- ------------------------------------------------------------------------------
-- 6. Tasks & Audit Logs (tasks, audit_logs)
-- ------------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks viewable and manageable by staff"
  ON public.tasks FOR ALL
  TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs viewable by organizers"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_admin_or_organizer());

CREATE POLICY "Audit logs append-only by authenticated users"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.is_staff());

-- ------------------------------------------------------------------------------
-- 7. Atomic Participant Check-in RPC Function
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.checkin_participant(p_token text, p_operator_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_now timestamptz := timezone('utc'::text, now());
  v_clean text := trim(p_token);
  v_is_uuid boolean;
BEGIN
  -- 1. Authorization: Only staff can operate checkin desk
  IF NOT public.is_staff() THEN
    RETURN jsonb_build_object(
      'status', 'unauthorized',
      'message', 'Only authorized staff and volunteers can check in attendees.'
    );
  END IF;

  IF v_clean IS NULL OR v_clean = '' THEN
    RETURN jsonb_build_object(
      'status', 'not_found',
      'message', 'Token or participant identifier is empty.'
    );
  END IF;

  -- 2. Lookup profile
  v_is_uuid := (v_clean ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

  IF v_is_uuid THEN
    SELECT * INTO v_profile FROM public.profiles
    WHERE id = v_clean::uuid OR qr_checkin_token = v_clean
    FOR UPDATE;
  ELSE
    SELECT * INTO v_profile FROM public.profiles
    WHERE qr_checkin_token = v_clean
    FOR UPDATE;
  END IF;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'status', 'not_found',
      'message', 'Participant badge not found. Check token or registration ID.'
    );
  END IF;

  -- 3. Verify participant approval
  IF v_profile.registration_status IS DISTINCT FROM 'approved' THEN
    RETURN jsonb_build_object(
      'status', 'not_approved',
      'message', 'Cannot check in: Participant registration status is "' || v_profile.registration_status || '". Must be "approved".',
      'profile', jsonb_build_object(
        'id', v_profile.id,
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'registration_status', v_profile.registration_status
      )
    );
  END IF;

  -- 4. Verify not already checked in
  IF v_profile.checked_in_at IS NOT NULL THEN
    RETURN jsonb_build_object(
      'status', 'already_checked_in',
      'message', 'Already checked in at ' || v_profile.checked_in_at::text || '.',
      'profile', jsonb_build_object(
        'id', v_profile.id,
        'full_name', v_profile.full_name,
        'email', v_profile.email,
        'checked_in_at', v_profile.checked_in_at
      )
    );
  END IF;

  -- 5. Mark checked in atomically
  UPDATE public.profiles
  SET checked_in_at = v_now,
      checked_in_by = p_operator_id,
      updated_at = v_now
  WHERE id = v_profile.id;

  -- 6. Insert audit log
  INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
  VALUES (
    p_operator_id,
    'participant_checkin',
    'profile',
    v_profile.id::text,
    jsonb_build_object(
      'token', v_clean,
      'participant_name', v_profile.full_name,
      'participant_email', v_profile.email,
      'checked_in_at', v_now
    )
  );

  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Participant check-in successfully recorded.',
    'profile', jsonb_build_object(
      'id', v_profile.id,
      'full_name', v_profile.full_name,
      'email', v_profile.email,
      'college_or_company', v_profile.college_or_company,
      'registration_status', v_profile.registration_status,
      'checked_in_at', v_now
    )
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.checkin_participant(text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.checkin_participant(text, uuid) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 8. Indexes for New Tables
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_judge_assignments_judge ON public.judge_assignments(judge_id);
CREATE INDEX IF NOT EXISTS idx_judge_assignments_submission ON public.judge_assignments(submission_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_judge ON public.evaluations(judge_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_submission ON public.evaluations(submission_id);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_team ON public.mentor_requests(team_id);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_status ON public.mentor_requests(status);
CREATE INDEX IF NOT EXISTS idx_mentor_requests_mentor ON public.mentor_requests(assigned_mentor_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_schedule_items_sort ON public.schedule_items(sort_order);
