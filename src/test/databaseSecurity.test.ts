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
});
