# VERTOTHON 2026 — Implementation Checklist

> **Tracking:** Active Engineering Punch List  
> **Repository:** `https://github.com/bharathwajverse/vertothon-2026.git`  

---

## Phase 0: Research, Audit & Planning Baseline (Current Status)

- [x] **Audit repository state:** Inspected directory, verified empty state, verified Git/Node/npm environments.
- [x] **Research public event details:** Gathered Vertofi Private Limited incorporation facts, target dates (Nov 14–15, 2026), offline format, and sources.
- [x] **Establish baseline documents:**
  - [x] `REQUIREMENTS_BASELINE.md`
  - [x] `REPOSITORY_AUDIT.md`
  - [x] `ARCHITECTURE.md`
  - [x] `IMPLEMENTATION_PLAN.md`
  - [x] `IMPLEMENTATION_CHECKLIST.md`
  - [x] `.env.example`
- [x] **Git initialization & safety:** Remote origin linked to `https://github.com/bharathwajverse/vertothon-2026.git`, standard `.gitignore` committed.

---

## Phase 1: Project Scaffolding & Foundation

- [ ] **1.1 Initialize frontend framework:** Run Vite template setup for React 18+ with TypeScript.
- [ ] **1.2 Styling system:** Install and configure Tailwind CSS 3.x, Autoprefixer, and Lucide React.
- [ ] **1.3 Routing setup:** Configure React Router v6+ with public, protected, and role-based routes.
- [ ] **1.4 Testing framework:** Setup Vitest, `@testing-library/react`, and jsdom.
- [ ] **1.5 Mock data service:** Create offline-first mock services for participants, teams, announcements, and metrics.
- [ ] **1.6 Shared UI components:** Build core atomic components:
  - [ ] Button (variants: primary, secondary, destructive, outline)
  - [ ] Input / Textarea / Select
  - [ ] Card / StatCard
  - [ ] Modal / Dialog
  - [ ] Badge / StatusTag
  - [ ] Toast notification system

---

## Phase 2: Authentication & Registration Workflow

- [ ] **2.1 Auth state management:** Create `AuthContext` with mock login, registration, and role switching for development.
- [ ] **2.2 Login & Sign Up views:** Responsive forms with validation.
- [ ] **2.3 Participant registration form:**
  - [ ] Personal & contact info
  - [ ] College / Organization & graduation year
  - [ ] Tech stack skills & GitHub handle
  - [ ] T-shirt size & dietary preferences
  - [ ] Resume / portfolio link
- [ ] **2.4 Approval state machine:** Organizer review actions (`approve`, `waitlist`, `reject`).

---

## Phase 3: Team Formation & Public Event Portal

- [ ] **3.1 Public Landing Page:**
  - [ ] Hero section with countdown timer
  - [ ] Event tracks (AI, Fintech, Open Innovation)
  - [ ] Timeline & schedule overview
  - [ ] FAQs accordion
  - [ ] Vertofi organizer footer
- [ ] **3.2 Team Creation Flow:** Team name, project theme, generate unique 6-character code.
- [ ] **3.3 Team Joining Flow:** Code validation, capacity check (max 4 members).
- [ ] **3.4 Team Management Dashboard:** Roster list, leader controls, leave team action.

---

## Phase 4: Event Control Room (Command Center)

- [ ] **4.1 KPI Overview Cards:** Total registrations, approval rate, check-in rate, teams count.
- [ ] **4.2 Participant Master Table:** Filter by status, search by name/email, pagination.
- [ ] **4.3 Broadcast Announcement Manager:** Publish real-time announcements with priority tags.
- [ ] **4.4 Incident Tracker:** Log operational issues with severity (low, medium, high, critical) and status (open, resolved).
- [ ] **4.5 Data Export:** Single-click CSV export of participants and teams.

---

## Phase 5: QR Check-in & Onsite Desk

- [ ] **5.1 Digital Attendee Pass:** Generate personal QR code on participant dashboard.
- [ ] **5.2 Volunteer Check-in Scanner:** In-browser camera QR code reader using `html5-qrcode`.
- [ ] **5.3 Instant Check-in Verification:** Show attendee profile, mark attended, prevent duplicate check-in.
- [ ] **5.4 Manual Lookup Fallback:** Search attendee by name/email if QR scanner is unavailable.

---

## Phase 6: Submissions, Mentoring & Judging Engine

- [ ] **6.1 Project Submission Form:** Repo URL, live demo, video URL, description, tech stack tags.
- [ ] **6.2 Submission Countdown & Lock:** Enforce submission deadline.
- [ ] **6.3 Mentor Request Queue:** Teams can request technical/design help; mentors accept tickets.
- [ ] **6.4 Judge Portal:** Submissions list, 5-criterion rubric scoring slider (1–10).
- [ ] **6.5 Result Approval Screen:** Aggregate scores, leaderboard ranking, organizer final publish button.

---

## Phase 7: Verification, Documentation & CI/CD

- [ ] **7.1 Unit tests:** Cover core business logic (team limits, score calculations, status transitions).
- [ ] **7.2 End-to-end user journey test:** Registration $\to$ Team Formation $\to$ Check-in $\to$ Submission $\to$ Judging.
- [ ] **7.3 GitHub Actions Workflow:** Automated build, lint, and test runner.
- [ ] **7.4 Production deployment:** Deploy live demo preview.
