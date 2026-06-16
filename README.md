# LIU Alumni & Opportunities Platform

A professional full-stack platform enabling alumni, students, and university administration to connect, share opportunities, and manage profiles securely.

## 📌 Problem Statement
Universities often struggle to maintain active connections with their alumni network. Existing students face difficulties in finding tailored internships and jobs, while instructors lack a centralized way to officially endorse and recommend students for specific opportunities. 

The **Alumni & Opportunity Platform** bridges this gap by providing a closed, role-based ecosystem where students, alumni, and faculty can seamlessly interact, post exclusive opportunities, and foster career growth—all under the strict governance of university administrators.

---

## 👥 Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| **`HEAD_ADMIN`** | Top-level system governor. | Post/Delete everywhere, generate `ADMIN` accounts, view global Audit Logs. |
| **`ADMIN`** | University staff member. | Delete any opportunity, view all recommendations, generate `INSTRUCTOR` accounts. |
| **`INSTRUCTOR`** | Faculty / Professor. | Post/Edit own opportunities, write official student recommendations. |
| **`ALUMNI`** | Graduated professional. | Self-register, post/edit own opportunities, browse jobs. |
| **`STUDENT`** | Current university attendee. | Self-register (`@liu.edu` restricted), browse opportunities, view received recommendations. |

---

## 🌟 Feature List

### MVP (Current Phase)
- **Role-Based Access Control (RBAC):** Strict boundaries utilizing JWT payloads.
- **Opportunities Module:** Centralized job and internship board with robust filters.
- **Endorsements System:** Instructors can directly attach recommendations mapping students to specific active jobs.
- **Admin Provisioning:** Restricted generation of staff accounts.
- **Audit Logging System:** Internal tracking of all significant administrative actions.
- **In-Memory Data Store:** High-speed development environment entirely detached from database constraints.

### Future Enhancements
- Persistent PostgreSQL Database via Prisma ORM.
- Direct User-to-User Messaging.
- Resume Uploading and Parsing.
- Automated Email Notifications.

---

## 🏗️ Architecture Overview

The system utilizes a modern Monorepo architecture split between a NodeJS/Express runtime and a React/Vite rendering engine.

### Backend (`/backend`)
- **`src/app.js` & `server.js`:** Express bootstrapping and listener.
- **`src/routes/`:** Express routers compartmentalized by domain (Auth, Opportunities, Admin, Recommendations).
- **`src/controllers/`:** Core business logic and request validation.
- **`src/services/`:** Abstracted helpers (like `auditLogService.js`).
- **`src/middleware/`:** Authentication guards (`requireAuth`, `requireRole`).
- **`src/data/`:** In-memory `mockDb.js` array stores simulating database layers.

### Frontend (`/frontend`)
- **`src/api/client.js`:** Centralized `fetch` wrapper automatically appending JWT authorization headers.
- **`src/context/AuthContext.jsx`:** Global React Provider managing user state and authentication persistence.
- **`src/components/ProtectedRoute.jsx`:** Higher-Order Component preventing unauthorized URL access.
- **`src/pages/`:** Isolated view components mapped strictly to the router.
- **`src/styles/`:** High-performance, vanilla CSS utilizing CSS Variables for strict design-token adherence.

---

## 🔒 Security Practices
- **Authentication:** Stateless, Signed **JWT (JSON Web Tokens)** issued on login.
- **Cryptography:** Passwords are never stored in plaintext, utilizing **Bcrypt** hashing with adaptive salt rounds before entering the data layer.
- **Access Control:** Layered RBAC middleware explicitly validating token claims before processing requests.
- **Identity Integrity:** Strict email domain validation (e.g., verifying `@liu.edu` handles) for student registration pipelines.

---

## 🚀 How to Run the Project

You will need to run the backend and frontend simultaneously in two separate terminal windows.

### 1) Environment Setup
Create a `.env` file in the `/backend` directory:
```env
PORT=5050
UNIVERSITY_DOMAIN=liu.edu
JWT_SECRET=super_secret_jwt_key_for_development
HEAD_ADMIN_EMAIL=admin@liu.edu
HEAD_ADMIN_PASSWORD=securepassword
```

### 2) Running the Backend
From the root directory:
```bash
cd backend
npm install
npm run dev
```
*API running on `http://localhost:5050`*

### 3) Running the Frontend
Open a second terminal from the root directory:
```bash
cd frontend
npm install
npm run dev
```
*UI running on `http://localhost:5173`*

---
*For a deeper dive into endpoints, user stories, and system architecture, please see the `/docs` folder.*
