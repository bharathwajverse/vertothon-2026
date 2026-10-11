# Contributing to VERTOTHON 2026

Thank you for your interest in contributing to the **VERTOTHON 2026 Operations Platform**! This document outlines our development workflows, coding conventions, testing guidelines, and commit standards.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free experience for everyone. Please be respectful and collaborative.

---

## 2. Development Workflow

1. **Fork or Branch:**
   * Create feature branches from `main`.
   * Use structured naming: `feat/<feature-name>`, `fix/<bug-name>`, `docs/<topic>`, `test/<suite>`.

2. **Commit Hygiene & Conventional Commits:**
   * We strictly follow Conventional Commits formatting:
     * `feat:` Introduces a new capability or module.
     * `fix:` Patches a bug or logic defect.
     * `docs:` Documentation additions or updates.
     * `style:` Formatting, whitespace, or style corrections with no logic changes.
     * `refactor:` Code restructuring without functional changes.
     * `test:` Adding or updating automated tests.
     * `chore:` Build scripts, dependencies, configuration tweaks.

3. **Pull Request Protocol:**
   * Provide a clear summary of what was accomplished.
   * Reference corresponding requirement IDs from `REQUIREMENTS_BASELINE.md`.
   * Ensure tests pass before opening PR.

---

## 3. Architecture & Security Rules

* **Payment Gateways:** Must remain disabled (`VITE_FEATURE_PAYMENTS_ENABLED=false`) until official organizer sign-off.
* **Row Level Security (RLS):** Every new database table must have RLS enabled with explicit policies.
* **Secrets:** Never commit secrets, `.env` files, or private access tokens.
