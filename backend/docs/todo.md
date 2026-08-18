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

