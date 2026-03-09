# API Reference Guide

All REST API endpoints are prefixed with `/api`. Standard responses utilize JSON.

---

## 1. Authentication & Profiles (`/auth`)

### `POST /auth/register/student`
Registers a student with the hardcoded university email domain.
```json
// Request Body
{
  "name": "Jane Doe",
  "email": "jane@liu.edu",
  "password": "strongpassword"
}
```

### `POST /auth/register/alumni`
Registers an alumnus requiring graduation verification.
```json
// Request Body
{
  "name": "John Doe",
  "email": "john.personal@gmail.com",
  "password": "strongpassword",
  "graduationYear": 2021
}
```

### `POST /auth/login`
Authenticates user, signs JWT with expiration, stores standard payload `(id, email, name, role)`.
```json
// Request Body
{
  "email": "admin@liu.edu",
  "password": "securepassword"
}
// Response (200 OK)
{
  "message": "Login successful",
  "token": "eyJhb..."
}
```

### `GET /auth/me`
*Header: `Authorization: Bearer <token>`*
Returns current user object.
```json
// Response
{
  "user": { "id": 1, "name": "System Admin", "role": "HEAD_ADMIN" }
}
```

---

## 2. Administration & Governance (`/admin`)

### `POST /admin/create-admin`
**(HEAD_ADMIN only)** Generates subsequent administrators.
```json
{
  "name": "New Admin",
  "email": "staff2@liu.edu",
  "password": "onboarding_pass"
}
```

### `POST /admin/create-instructor`
**(ADMIN only)** Generates faculty accounts enabling endorsement powers.
```json
{
  "name": "Professor Smith",
  "email": "smith@liu.edu",
  "password": "onboarding_pass"
}
```

### `GET /audit?page=1&limit=10`
**(HEAD_ADMIN only)** Returns descending chronological array of tracked entity states.
```json
// Response
{
  "total": 4,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 4,
      "actorUserId": 1,
      "actorRole": "HEAD_ADMIN",
      "action": "create-admin",
      "targetType": "USER",
      "targetId": 2,
      "timestamp": "2024-03-09T20:00:00.000Z"
    }
  ]
}
```

---

## 3. Opportunities Panel (`/opportunities`)

### `POST /opportunities`
**(INSTRUCTOR, ALUMNI only)** Mints a new posting into the global repository.
```json
{
  "title": "Junior Full Stack Dev",
  "company": "Tech Corp NYC",
  "type": "JOB", // or INTERNSHIP
  "mode": "HYBRID", // or ONSITE, REMOTE
  "location": "New York, NY",
  "description": "Building React UIs.",
  "requirements": ["React", "Express", "Vite"]
}
```

### `GET /opportunities`
Returns all posts with optional query string filters: `?type=JOB&mode=REMOTE&search=tech`.

### `GET /opportunities/:id`
Returns raw verbose payload for an individual entry.

### `PATCH /opportunities/:id`
**(Owner only)** Deep-merges modified payloads while restricting internal properties (`createdAt`, `createdByRole`).

### `DELETE /opportunities/:id`
**(Owner or ADMIN only)** Drops record from memory.

---

## 4. Recommendations System (`/recommendations`)

### `POST /recommendations`
**(INSTRUCTOR only)** Attaches a static endorsement linking Instructor -> Student -> Job.
```json
{
  "studentId": 3,
  "opportunityId": 1,
  "message": "This student ranked top of their algorithms class."
}
```

### `GET /recommendations/mine`
**(INSTRUCTOR only)** Filters and arrays endorsements where `instructorId === req.user.id`.

### `GET /recommendations/for-me`
**(STUDENT only)** Filters and arrays endorsements where `studentId === req.user.id`.

### `GET /recommendations`
**(ADMIN/HEAD_ADMIN only)** Returns all systemic recommendations.
