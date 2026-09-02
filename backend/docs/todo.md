# Architecture & Domain Decisions

### 1. User identity
Q: What is the primary unique identifier for User?
- Status: Deferred

Current options:
- email
- phone
- email + phone
- add username based
- add telegram based auth

Current decision: deferred until auth implementation
Why: the v0.1 happy path does not require a finalized authentication model yet. Choosing the identity strategy now would introduce decisions for a feature that is intentionally implemented later
When: before implementing the Auth vertical slice

### 2. Appointment conflict detection
Q: How should overlapping appointments for the same master handled?
- Status: Deferred

Current decision: not implemented yet
Why: conflict detection is a business rule required for safe appointment creation, but it is not needed to complete the current database foundation milestone
When: resolve during Appointment vertical slice

### 3. Appointment delete semantics
Q: What should happen to appointments when a client/master/service is deleted?
- Status: Deferred

Current decision: deffered
Why: delete operations are explicitly outside the v0.1 happy path, so their data-retention and referential-integrity rules are not required yet
When: before implementing any delete operation for Client, Master, or Service

### 4. Appointment end_at and duration sync
Q: Should `ends_at` be stored together with `duration`, and where should `ends_at` be calculated?
- Status: Deferred

Current decision: keep `starts_at`, `ends_at`, and `duration` in the v0.1 schema. `ends_at` should be calculated by the backend from `starts_at + duration`
Why: the current domain model explicitly treats `duration` as part of the appointment snapshot while the Calendar needs both start and end boundaries. Backend calculation prevents the client from independently defining inconsistent values
When: revisit during Appointment service implementation if a stronger database-level consistency rule becomes necessary

### 5. Phone normalization
Q: What canonical phone format should be stored in the database and where should normalization occur?
- Status: Deferred

Current decision: the database stores phone numbers in canonical digits-only form. Frontend may format the value for display, but backend is responsible for normalization and validation before persistence. Zod validates the normalized API input shape
Why: the database should not depend on frontend formatting, and the same normalization rule must work for every API client
When: define the exact normalization rules before implementing the Client API

### 6. Email validation
Q: Should email format be enforced by PostgreSQL or only by application-level validation?
- Status: Deferred

Current decision: email format validation remains at the application layer. The database is responsible for storage, NOT NULL, and uniqueness, but not for complex email syntax validation
Why: email syntax is application-level input validation and complex SQL CHECK logic would duplicate validation rules without adding meaningful value to the current v0.1 database design
When: revisit only if a concrete requirement appears for database-level enforcement across non-application data sources

### 7. Environment variables runtime validation
Q: How should environment variables be validated and typed across the project?
- Status: Deferred

Current options:
- Manual parsing with default fallback values (current approach)
- Strict runtime validation via Zod schema
- dotenv-safe / envalid integration

Current decision: keep simple fallback parsing in env.ts for foundation setup, avoiding process.env.X! non-null assertions.
Why: Why: early v0.1 foundation stage should avoid adding strict runtime schemas until the core application structure and deployment requirements are fully stabilized.
When: during application bootstrap setup prior to introducing external integrations or production deployments.

### 8. API versioning
Q: Should the API use URL versioning such as `/api/v1` and when should versioning be introduced?
- Status: Deferred

Current decision: use `/api/...` without a version for the current internal API
Why: the API is currently consumed only by our own frontend, so independent API compatibility is not yet a requirement. URL versioning would add structure without solving a current problem
When: reconsider when the API becomes independently consumed, a breaking API compatibility requirement appears, or external clients are introduced

### 9. Appointment timezone
Q: What timezone should be used when creating, storing, and displaying appointment times?
- Status: Deferred

Current decision: store appointment timestamps using PostgreSQL `TIMESTAMPTZ`; the application timezone policy is not finalized yet
Why: Calendar behavior depends on a consistent interpretation of local salon time, but timezone handling is not required to complete the current database foundation
When: before implementing Appointment creation and Calendar

### 10. Money and currency
Q: How should money and currency be represented?
- Status: Deferred

Current decision: store monetary values as PostgreSQL NUMERIC; the currency model is not yet explicitly represented
Why: v0.1 currently operates in a single-currency context and does not require multi-currency support
When: before introducing multiple currencies, external payments, accounting, or multi-tenant support

### 11. Service identity
Q: Should Service.name be unique?
- Status: Deferred

Current decision: service names are not required to be unique in the current schema
Why: v0.1 requirements do not define whether two services with the same display name are allowed
When: before implementing Service creation and catalog management

### 12. Master phone uniqueness
Q: Should each active Master have a unique phone number?
- Status: Deferred

Current decision: phone is currently unique in the schema, but the business rule has not been explicitly defined
Why: the current v0.1 requirements specify a phone field but do not define phone uniqueness for masters
When: before implementing Master creation

### 13. Authentication and password policy
Q: How should authentication, password hashing, sessions, and account recovery work?
- Status: Deferred

Current decision: authentication is intentionally outside the current foundation and happy path
Why: v0.1 can be developed without finalizing the authentication model
When: before implementing the Auth vertical slice

### 14. Sensitive data logging
Q: Which request fields must be redacted from application logs?
- Status: Deferred

Current decision: full request bodies are currently logged during development for debugging
Why: detailed request logging is useful while building and debugging the API and sensitive fields are not yet present in the current HTTP endpoints
When: before authentication, password handling, tokens, or other sensitive data are introduced

### 15. Migration tracking
Q: How should the project track which SQL migrations have already been applied?
- Status: Deferred

Current decision: SQL migrations are currently applied manually
Why: the project is still at the database foundation stage and manual migrations are intentionally used as a learning exercise
When: when the number of migrations makes manual tracking error-prone or automated deployment becomes necessary