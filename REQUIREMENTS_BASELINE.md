# VERTOTHON 2026 Operations Platform — Requirements Baseline

> **Document Status:** Baseline / Approved for Planning  
> **Target Event:** VERTOTHON 2026 by Vertofi Private Limited  
> **Planning Horizon:** Offline Hackathon, Hyderabad, India (Target Dates: November 14–15, 2026)  
> **Planning Capacity:** Configurable scale up to 1,000 participants  

---

## 1. Executive Summary & Purpose

VERTOTHON 2026 is a flagship offline hackathon organized by **Vertofi Private Limited** (Hyderabad, India). The event convenes students, developers, designers, and innovators to solve real-world industry problems in artificial intelligence, fintech, and modern software engineering.

The **VERTOTHON 2026 Operations Platform** serves as the unified event operating system, managing the end-to-end event lifecycle:
1. Public event portal and marketing.
2. Participant registration, team formation, and organizer review.
3. Live event operations dashboard (Event Control Room).
4. Onsite attendee check-in and access badges.
5. Project submission pipeline, judging workflows, scoring rubrics, and result dissemination.

---

## 2. Event Information Classification Matrix

To adhere strictly to engineering rigor and avoid inventing facts, all event details are partitioned into four categories:

### A. Verified Public Information (Evidence-backed)
*   **Organizer Entity:** Vertofi Private Limited, incorporated February 2026 in Hyderabad, Telangana (Registered in Rajendranagar area).
*   **Key Organizers / Leadership:** Varshith Chowdary, Muthina Abhilash, Tagarampudi Issaku.
*   **Event Target Dates:** November 14–15, 2026.
*   **Registration Deadline:** October 31, 2026.
*   **Nature:** Offline Hackathon in Hyderabad, India.
*   **Participant Focus:** Developers, designers, students, entrepreneurs, innovators.
*   **Public Sources:** 
    *   Luma Event Listing & Vertofi Socials: `https://lu.ma`
    *   Corporate Registry Data: Tracxn / MCA India
    *   Vertofi Community Announcements: Instagram / Internshala / LinkedIn

### B. Organizer-Confirmed Decisions (Operational Guardrails)
*   Payments are **strictly disabled** for Phase 0 & Prototype; awaiting final fee/ticketing approval from organizers.
*   AI assistance and automated evaluation are deferred to later phases.
*   The system must support an organizer review/approval step for incoming applicant registrations.
*   The architecture must run with role-based access control (RBAC).

### C. Working Engineering Assumptions (Configurable Defaults)
*   **Team Size Limits:** Default min 1, max 4 members per team (modifiable via Control Room settings).
*   **Participant Capacity:** Engineered to handle up to 1,000 concurrent participants, mentors, judges, and volunteers.
*   **Submission Criteria:** Git repository URL, live preview link, demo video link, project abstract, track selection.
*   **Judging Rubric Standard:** 5-criteria weighted scoring (Innovation, Technical Complexity, UI/UX, Viability, Presentation) on a 1–10 scale.

### D. Unresolved Questions Requiring Organizer Confirmation
*   Physical venue location within Hyderabad (e.g., T-Hub, university campus, convention center).
*   Whether registration is free or paid (and tier pricing if paid).
*   Official tracks/problem statements and sponsor prize pool distribution.
*   Offline check-in hardware requirements (QR scanning via mobile browser camera vs dedicated scanners).

---

## 3. Core Functional Requirements Checklist

### Module 1: Public Event Website
- [ ] **R1.1:** Responsive landing page presenting event countdown, overview, rules, schedule overview, and FAQs.
- [ ] **R1.2:** Dynamic announcement ticker/banner driven by the organizer portal.
- [ ] **R1.3:** Call-to-Action buttons for "Register as Participant", "Apply as Mentor", and "Organizer Login".

### Module 2: Authentication & Role-Based Permissions (RBAC)
- [ ] **R2.1:** Secure user authentication (Email/Password & OAuth providers).
- [ ] **R2.2:** Multi-role model:
  - `admin` (Organizer / Platform Admin)
  - `lead_organizer` (Full operational control)
  - `volunteer` (Check-in scanner & announcements)
  - `judge` (Submission scoring & evaluation)
  - `mentor` (Team mentorship & request queue)
  - `participant` (Registration, team, submission)
- [ ] **R2.3:** Strict Row Level Security (RLS) ensuring participants cannot modify foreign profiles, teams, or scorecards.

### Module 3: Participant Registration & Approval Workflow
- [ ] **R3.1:** Registration intake form capturing profile data, GitHub, LinkedIn, portfolio, experience level, tech stack, dietary requirements, and T-shirt size.
- [ ] **R3.2:** State machine for applicant status: `pending_review` $\to$ `approved` | `waitlisted` | `rejected`.
- [ ] **R3.3:** Bulk approval and notification triggers in Organizer Dashboard.

### Module 4: Team Formation & Management
- [ ] **R4.1:** Create a team with unique join code / invitation link.
- [ ] **R4.2:** Join existing team using join code.
- [ ] **R4.3:** Team leader capabilities: transfer ownership, remove member, edit team name & project title.
- [ ] **R4.4:** Solo participant matching / open team directory.

### Module 5: Event Control Room (Command Center)
- [ ] **R5.1:** Real-time metrics overview: total registered, approved, checked-in count, team count, submission progress.
- [ ] **R5.2:** Master participant and team tables with filtering, search, and CSV export.
- [ ] **R5.3:** System broadcast manager (send global in-app alerts and banners).
- [ ] **R5.4:** Incident tracker (log operational, logistical, or technical issues with severity levels: low, medium, high, critical).

### Module 6: Schedules, Tasks & Live Timelines
- [ ] **R6.1:** Dynamic interactive schedule (Opening ceremony, hacking starts, meals, mentor rounds, submission deadline, final pitch).
- [ ] **R6.2:** Organizer task manager with assignment and completion tracking.

### Module 7: Attendance & Check-in Desk
- [ ] **R7.1:** Unique QR code generation for approved participants.
- [ ] **R7.2:** Fast in-browser camera QR code scanner for check-in volunteers.
- [ ] **R7.3:** Badge print preview / digital check-in pass.

### Module 8: Project Submission Pipeline
- [ ] **R8.1:** Submission form validating GitHub URL, demo link, video URL, track, description, and asset uploads.
- [ ] **R8.2:** Submission countdown timer locking edits upon deadline expiration.
- [ ] **R8.3:** Submission status indicators: `draft`, `submitted`, `under_review`, `scored`.

### Module 9: Mentoring & Judging Workflows
- [ ] **R9.1:** Mentor help desk: participants request mentor assistance by topic/table; mentors accept and resolve tickets.
- [ ] **R9.2:** Judge portal: assigned submissions list, rubrics, input scorecards (1–10 per criterion) with constructive feedback.
- [ ] **R9.3:** Result approval screen: normalized score aggregation, tie-breakers, organizer final approval prior to public release.

### Module 10: Reporting, Auditability & Export
- [ ] **R10.1:** Export all teams, participants, scores, and check-in logs to CSV/Excel.
- [ ] **R10.2:** Audit logs tracking administrative status changes.

---

## 4. Non-Functional & Quality Requirements

*   **Performance:** Sub-second response times for dashboard views; static pages load under 1.5 seconds.
*   **Scalability:** Concurrent load testing for 1,000 active participants during opening check-in and submission deadlines.
*   **Accessibility & UX:** Mobile-first responsive UI, WCAG AA compliant contrast, dark/light theme support.
*   **Security:** RLS policies on all PostgreSQL tables, input sanitization, rate limiting on authentication endpoints, strict separation of secrets.
