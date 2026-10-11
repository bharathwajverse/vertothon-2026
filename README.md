# VERTOTHON 2026 — Operations Platform by Vertofi

![VERTOTHON 2026](https://img.shields.io/badge/Event-VERTOTHON_2026-blue.svg)
![Status](https://img.shields.io/badge/Phase-Phase_0_Baseline_Audit-brightgreen.svg)
![Organizer](https://img.shields.io/badge/Organizer-Vertofi_Private_Limited-orange.svg)
![Location](https://img.shields.io/badge/Location-Hyderabad%2C_India-red.svg)
![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)

The **VERTOTHON 2026 Operations Platform** is a full-featured, modular event management operating system engineered for **VERTOTHON 2026**, the flagship offline hackathon organized by **Vertofi Private Limited** in Hyderabad, India.

Designed to comfortably scale up to **1,000 concurrent participants, mentors, judges, and organizers**, this platform provides end-to-end tooling across all hackathon phases.

---

## 🎯 Target Event Overview

* **Organizer:** Vertofi Private Limited (Incorporated in Hyderabad, Telangana)
* **Format:** In-Person / Offline Hackathon
* **Target Dates:** November 14–15, 2026
* **Location:** Hyderabad, Telangana, India
* **Registration Deadline:** October 31, 2026
* **Focus Areas:** AI, Fintech, Web3, and Open Innovation

---

## 📑 Core Documentation Index

This repository adheres to strict software engineering and architecture documentation standards:

1. 📋 [**REQUIREMENTS_BASELINE.md**](./REQUIREMENTS_BASELINE.md): Exhaustive functional and non-functional requirements catalog, role breakdown, and public research citations.
2. 🔍 [**REPOSITORY_AUDIT.md**](./REPOSITORY_AUDIT.md): Initial repository state audit, gap analysis, and risk mitigations.
3. 🏗️ [**ARCHITECTURE.md**](./ARCHITECTURE.md): Full technical architecture, ERD diagrams, Row Level Security policies, and directory structure.
4. 🗺️ [**IMPLEMENTATION_PLAN.md**](./IMPLEMENTATION_PLAN.md): Phased roadmap from Milestone 0 to Milestone 7, with verification criteria.
5. ✅ [**IMPLEMENTATION_CHECKLIST.md**](./IMPLEMENTATION_CHECKLIST.md): Itemized engineering punch list for every module.

---

## 🚀 Key Modules & Capabilities

* **Public Event Portal:** Landing page, countdown timer, live announcements, track overviews, and FAQ.
* **Authentication & RBAC:** Secure multi-role access control (`admin`, `lead_organizer`, `volunteer`, `judge`, `mentor`, `participant`).
* **Registration & Approval Flow:** Comprehensive attendee intake form with organizer approval/waitlist/rejection review.
* **Team Management:** Team creation, unique join codes, member limits (1–4), and leadership transfer.
* **Event Control Room (Command Center):** Real-time operational metrics, attendee table, broadcast announcements, and incident logger.
* **QR Check-In Desk:** High-speed in-browser camera scanning and digital attendee passes with duplicate check-in prevention.
* **Submission Pipeline:** GitHub, live demo, and video submission form with deadline locking.
* **Mentoring & Judging System:** Mentorship ticket queue, 5-criterion rubric scoring, normalized leaderboards, and organizer result approval.

---

## 🛠️ Recommended Technology Stack

* **Frontend:** React 18+, TypeScript, Vite, Tailwind CSS, Lucide React
* **State Management:** TanStack Query (React Query) + Zustand
* **Database & Auth:** PostgreSQL / Supabase with Row Level Security (RLS)
* **Check-In Scanning:** `html5-qrcode` & `qrcode.react`
* **Validation:** Zod + React Hook Form
* **Testing:** Vitest + React Testing Library

---

## ⚙️ Quick Start (Development)

### Prerequisites
* Node.js v18+ or v20+
* npm or pnpm
* Git

### Installation
```bash
# Clone the repository
git clone https://github.com/bharathwajverse/vertothon-2026.git
cd vertothon-2026

# Copy environment variables
cp .env.example .env

# Install dependencies (upon Milestone 1 initialization)
npm install

# Start local development server
npm run dev
```

---

## 🔒 Security & Policies

* **Payment Processing:** Payment gateways are kept disabled (`VITE_FEATURE_PAYMENTS_ENABLED=false`) until official organizer sign-off.
* **Data Access:** All data interactions are guarded by Row Level Security (RLS).
* **Sensitive Credentials:** Never commit `.env` files or API secrets.

---

## 👥 Contributors

* **Organizer:** [Vertofi Private Limited](https://lu.ma)
* **Project Maintainer:** [bharathwajverse](https://github.com/bharathwajverse)
