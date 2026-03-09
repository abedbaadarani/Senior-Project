# System Feature Epics

This document defines the core user stories validating the **LIU Alumni & Opportunities Platform**.

---

## Epic 1: Identity & Authentication Management

### User Story 1.1: Student Onboarding
**As a** current university student, 
**I want to** register for the platform using my official university email, 
**So that** my student status is verified without manual administrative review.
- **Acceptance Criteria:**
  - System rejects emails that do not match the configured domain (e.g., `@liu.edu`).
  - Account assigned `STUDENT` role automatically.

### User Story 1.2: Alumni Onboarding
**As a** graduated alumnus, 
**I want to** register using any personal email by proving my graduation year, 
**So that** I can network and post jobs without an active school email.
- **Acceptance Criteria:**
  - Requires a valid integer for `graduationYear`.
  - Account assigned `ALUMNI` role.

---

## Epic 2: Opportunities Exchange

### User Story 2.1: Sourcing Talent
**As an** Instructor or Alumnus, 
**I want to** post detailed job or internship descriptions to the platform, 
**So that** students in my network can discover them.
- **Acceptance Criteria:**
  - Must include Title, Company, Format (`REMOTE`|`ONSITE`|`HYBRID`), and Description.
  - Creator assigned "Ownership" rights to edit/delete the post.

### User Story 2.2: Discovering Roles
**As a** registered Student, 
**I want to** filter and search through active job postings, 
**So that** I can find roles matching my desired internship or job criteria.
- **Acceptance Criteria:**
  - Board filters by search strings and drop-down job formats.

---

## Epic 3: Professional Endorsements

### User Story 3.1: Recommending a Candidate
**As an** Instructor, 
**I want to** write a recommendation securely linking a specific student to a specific job posting, 
**So that** employers understand my academic endorsement of the candidate.
- **Acceptance Criteria:**
  - Cannot recommend non-students.
  - Cannot recommend for non-existent jobs.
  - Instructors can view a historical log of all recommendations they have authored.

### User Story 3.2: Receiving Endorsements
**As a** Student, 
**I want to** see recommendations instructors have submitted on my behalf, 
**So that** I can track my professional networking health.
- **Acceptance Criteria:**
  - Students cannot see recommendations written for *other* students.
  - Students cannot author their own recommendations.

---

## Epic 4: Administrative Governance

### User Story 4.1: Moderation
**As an** Admin, 
**I want to** have the authority to delete any job opportunity, 
**So that** I can remove inappropriate or expired posts overriding the original creator.

### User Story 4.2: Instructor Provisioning
**As an** Admin, 
**I want to** manually generate Instructor accounts, 
**So that** faculty can join the platform securely without open registration.

### User Story 4.3: Audit Logging
**As the** Head Admin, 
**I want to** view a chronological log of all administrator actions, 
**So that** I can trace exactly who modified the system and when.
- **Acceptance Criteria:**
  - System tracks account creation, job creation, job deletion, and recommendations.
  - Accessible strictly to the `HEAD_ADMIN` role via a paginated data log.
