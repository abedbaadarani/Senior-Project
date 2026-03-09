# Senior Project Committee Presentation
## Live Demonstration Script

This script outlines the exact flow of the live presentation to the university committee, ensuring all technical requirements (RBAC, Auditing, Role Dynamics) are showcased efficiently.

---

### Step 1: Pre-Demo Diagnostics (3 mins)
*Environment: Presenter Terminal.*
1. Presenter explicitly shows two cleanly integrated terminal windows running concurrently (`backend` and `frontend`).
2. Presenter opens `c:\Users\Admin\Desktop\Senior Project\backend\.env`.
3. Presenter explains to the committee how the system bootstraps the immutable `HEAD_ADMIN` account strictly from the Server runtime variables (`admin@liu.edu`).

---

### Step 2: Access & Governance Architecture (5 mins)
*Environment: Split Screen UI (`http://localhost:5173/login`).*
1. **The Breach Attempt:** Presenter attempts to access `/head-admin` directly in the URL without logging in. The system strictly rebounds the viewer to the Login page via Frontend Middleware Route Defenses.
2. **The Authentication Core:** Presenter logs into `admin@liu.edu` mapping to the backend payload.
3. **The Governance Dashboard:** Presenter clicks the `Governance Panel`.
   - Explain the current blank Audit Logs frame.
   - Explain that creating an `ADMIN` is an extremely high-level action mapped explicitly to `POST /api/admin/create-admin`.
   - Presenter creates an ADMIN account (`staff@liu.edu`, `pass123`).
   - *Key Moment:* Hit submit and watch the table instantly auto-update reading from the global in-memory Audit Log payload highlighting the date and actor performing the system change.

---

### Step 3: Identity & Provisioning (5 mins)
*Environment: Admin Panel (`/admin`).*
1. Presenter logs out of `HEAD_ADMIN` and subsequently logs into the newly minted `staff@liu.edu`.
2. Presenter opens the `Admin Panel` and explains how the staff does *not* have access to the Head Administrator's Governance oversight table.
3. Staff creates an `INSTRUCTOR` account (`prof.smith@liu.edu`, `pass123`).
4. Log out.

---

### Step 4: Opportunities Marketplace (7 mins)
*Environment: Instructor Session.*
1. Log in as `prof.smith@liu.edu`.
2. Navigate to `My Posts` (The exclusive Instructor/Alumni environment).
3. Presenter generates a `JOB` listing for "Software Engineer" using raw text requirements. Show how the database formats it into a mapped array.
4. Presenter clicks the post, hits **Edit Post**, and mutates the description dynamically testing the `PATCH` endpoint logic.

---

### Step 5: System Integrations - The Recommendation Pipeline (5 mins)
*Environment: Student Dashboard.*
1. **The Strict Pipeline:** Presenter opens a private incognito window and hits "Student Registration".
2. Presenter deliberately attempts to register with `student@gmail.com`. The system rejects the payload.
3. Presenter registers with `student@liu.edu`. The system builds their data payload.
4. Go back to the Instructor's active session. The Instructor finds their job post, hits "Recommend a Student", types `ID: 3`, and adds an endorsement.
5. In the incognito window (Student Session), they refresh `/recommendations`. The specific endorsement appears cleanly stylized on the UI linked exclusively to that job.

---

### Step 6: Full Accountability Loop (1 min)
*Environment: Governance Loop.*
1. Presenter switches back to `admin@liu.edu` (Head Admin).
2. Look at the Governance Panel. 
3. *Key Moment:* The Audit log table now contains rows perfectly highlighting the `ADMIN` making the instructor, the `INSTRUCTOR` making the job, and the `INSTRUCTOR` making the recommendation—proving to the committee full architectural tracking. 

---
**END OF PRESENTATION.**
*(Transition to Q&A Session)*
