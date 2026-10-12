import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Database Security & RLS Policy Static Audit', () => {
  const migrationPath = path.resolve(__dirname, '../../supabase/migrations/20261012000000_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  it('migration file exists and is populated', () => {
    expect(migrationSql.length).toBeGreaterThan(1000);
  });

  it('enforces search_path security with pg_temp on all SECURITY DEFINER functions', () => {
    // SECURITY DEFINER functions must set search_path = public, auth, pg_temp to prevent schema hijacking
    const securityDefinerBlocks = migrationSql.match(/SECURITY DEFINER[\s\S]*?AS \$\$/gi);
    expect(securityDefinerBlocks).not.toBeNull();
    expect(securityDefinerBlocks!.length).toBeGreaterThanOrEqual(4);

    securityDefinerBlocks!.forEach((block) => {
      expect(block).toMatch(/SET search_path = public, auth, pg_temp/i);
    });
  });

  it('revokes default execution permissions on helper functions from PUBLIC', () => {
    expect(migrationSql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_admin_or_organizer\(\) FROM PUBLIC;/i);
    expect(migrationSql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_staff\(\) FROM PUBLIC;/i);
    expect(migrationSql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_judge\(\) FROM PUBLIC;/i);
    expect(migrationSql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.get_user_role\(UUID\) FROM PUBLIC;/i);
    expect(migrationSql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.get_user_status\(UUID\) FROM PUBLIC;/i);
  });

  it('grants function execution only to authenticated and service_role', () => {
    expect(migrationSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.is_admin_or_organizer\(\) TO authenticated, service_role;/i);
    expect(migrationSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.is_staff\(\) TO authenticated, service_role;/i);
    expect(migrationSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.get_user_role\(UUID\) TO authenticated, service_role;/i);
    expect(migrationSql).toMatch(/GRANT EXECUTE ON FUNCTION public\.get_user_status\(UUID\) TO authenticated, service_role;/i);
  });

  it('enforces profile role and status immutability at trigger level', () => {
    // Ensures participants cannot self-escalate to organizer or self-approve status
    expect(migrationSql).toMatch(/CREATE TRIGGER trg_enforce_profile_immutability/i);
    expect(migrationSql).toMatch(/BEFORE UPDATE ON public\.profiles/i);
    expect(migrationSql).toMatch(/FOR EACH ROW EXECUTE FUNCTION public\.enforce_profile_role_immutability\(\)/i);
    expect(migrationSql).toMatch(/Ordinary users cannot alter their assigned role/i);
    expect(migrationSql).toMatch(/Registration approval status can only be modified by organizers/i);
  });

  it('validates team capacity and membership constraints at engine level', () => {
    // Ensures only approved participants can join teams and capacity is not exceeded
    expect(migrationSql).toMatch(/CREATE TRIGGER trg_check_team_capacity/i);
    expect(migrationSql).toMatch(/BEFORE INSERT ON public\.team_members/i);
    expect(migrationSql).toMatch(/Cannot join a team until registration is approved by organizers/i);
    expect(migrationSql).toMatch(/Team has reached its maximum member capacity/i);
  });

  it('enables Row Level Security on all core operational tables', () => {
    const coreTables = [
      'profiles',
      'teams',
      'team_members',
      'submissions',
      'incidents',
      'announcements'
    ];

    coreTables.forEach((table) => {
      const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
      expect(migrationSql).toMatch(rlsRegex);
    });
  });

  describe('Batch 2 Migration Security & RLS Expansion Audit', () => {
    const batch2MigrationPath = path.resolve(__dirname, '../../supabase/migrations/20261012010000_event_operations_expansion.sql');
    const batch2Sql = fs.readFileSync(batch2MigrationPath, 'utf8');

    it('batch 2 migration file exists and is populated', () => {
      expect(batch2Sql.length).toBeGreaterThan(1000);
    });

    it('drops overly broad profile SELECT policy and enforces strict least-privilege policies', () => {
      expect(batch2Sql).toMatch(/DROP POLICY IF EXISTS "Profiles readable by authenticated users" ON public\.profiles;/i);
      expect(batch2Sql).toMatch(/CREATE POLICY "Users can read own profile"/i);
      expect(batch2Sql).toMatch(/CREATE POLICY "Staff can read all profiles"/i);
      expect(batch2Sql).toMatch(/CREATE POLICY "Teammates can read teammate profiles"/i);
    });

    it('creates public_profiles view exposing only safe directory fields', () => {
      expect(batch2Sql).toMatch(/CREATE OR REPLACE VIEW public\.public_profiles AS/i);
      expect(batch2Sql).toMatch(/full_name,/i);
      expect(batch2Sql).toMatch(/role,/i);
      expect(batch2Sql).toMatch(/github_profile/i);
      const viewMatch = batch2Sql.match(/CREATE OR REPLACE VIEW public\.public_profiles AS([\s\S]*?)FROM public\.profiles;/i);
      expect(viewMatch).not.toBeNull();
      const viewProjection = viewMatch![1];
      expect(viewProjection).not.toMatch(/\bemail\b/i);
      expect(viewProjection).not.toMatch(/\bphone\b/i);
      expect(viewProjection).not.toMatch(/\bdietary_requirements\b/i);
      expect(viewProjection).not.toMatch(/\bt_shirt_size\b/i);
      expect(viewProjection).not.toMatch(/\bqr_checkin_token\b/i);
    });

    it('enables Row Level Security on all Batch 2 tables', () => {
      const batch2Tables = [
        'event_settings',
        'schedule_items',
        'judge_assignments',
        'evaluations',
        'mentor_requests',
        'tasks',
        'audit_logs',
      ];

      batch2Tables.forEach((table) => {
        const rlsRegex = new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY;`, 'i');
        expect(batch2Sql).toMatch(rlsRegex);
      });
    });

    it('enforces SECURITY DEFINER search_path hardening on checkin_participant and is_mentor', () => {
      expect(batch2Sql).toMatch(/FUNCTION public\.checkin_participant[\s\S]*?SECURITY DEFINER[\s\S]*?SET search_path = public, auth, pg_temp/i);
      expect(batch2Sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.checkin_participant\(text, uuid\) FROM PUBLIC;/i);
      expect(batch2Sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.checkin_participant\(text, uuid\) TO authenticated, service_role;/i);

      expect(batch2Sql).toMatch(/FUNCTION public\.is_mentor\(\)[\s\S]*?SECURITY DEFINER[\s\S]*?SET search_path = public, auth, pg_temp/i);
      expect(batch2Sql).toMatch(/REVOKE EXECUTE ON FUNCTION public\.is_mentor\(\) FROM PUBLIC;/i);
    });
  });
});
