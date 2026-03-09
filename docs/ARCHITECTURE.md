# System Architecture

The LIU Connect platform leverages a modern, decoupled full-stack architecture optimized for high performance, ease of scaling, and rapid iteration.

---

## High Level Components

```mermaid
graph TD
    A[Client Browser (React/Vite SPA)] -->|REST JSON via HTTPS| B(Express Request Router)
    B --> C{Authentication Middleware}
    C -- Failed --> D[401/403 Error Response]
    C -- Passed --> E(Controllers & Business Logic)
    E --> F[In-Memory Mock Database]
    E --> G[Role-Based Validation]
    G -- Admin Action --> H(System Audit Logger Service)
```
*(Placeholder: Insert comprehensive PPT infrastructure architecture diagram here targeting committee presentation)*

---

## Detailed Data Flow Diagram

```text
[Frontend Pages] --> [Axios/Fetch Interceptor] --> (HTTP Network)
                                                    |
                                                    v
[Incoming Request] --> [Express App] --> [Routing Layer] --> [JWT Token Decryption]
                                                                |
[Invalid Roles] <---(Middleware Rejection)----------------------|
                                                                v
[Controller Execution] --> [Data Repository Logic] <--> (In-Memory Array Store)
           |
           v
[JSON Response Body] --> (HTTP Network) --> [Frontend React State Update] --> [Virtual DOM Paint]
```

### Component Breakdown

#### The Presentation Layer (Frontend)
- **Framework:** React SPA (Single Page Application) initialized via Vite for lightning-fast HMR and minimal bundling overhead.
- **Routing Engine:** React Router utilizing nested layouts to securely protect boundaries (`<ProtectedRoute>` component wrapping paths).
- **Communication Protocol:** Encapsulated Fetch configuration centrally managing Token Storage mapping directly to `window.localStorage`.
- **Global Auth Context:** Re-renders the navigation bar explicitly reading the decrypted user properties via `/api/auth/me`.

#### The Business Layer (Backend)
- **Web Runtime:** NodeJS executing Express.js handling asynchronous Non-Blocking I/O processing.
- **Security Fabric:** `jsonwebtoken` handles encoding signature expiration and structural validations securely bypassing cookie CORS attacks via active HTTP header injection (`Bearer <token>`).
- **Data Encapsulation:** Clean separation using the Repository Pattern (`opportunityRepository.js`, `userRepository.js`). Controllers never mutate the underlying data store arrays directly.
- **Audit Logging Injection:** Systemic administrative events are captured post-validation by an abstracted `auditLogService.js` keeping Controller implementations completely pure.

---
*(Placeholder: Attach Database Schema visualization for future PostgreSQL/Prisma migration during Phase 2 of the Senior Project)*
