# CaliGuide P2 Features - Roadmap

## Overview
Implement P2 priority features to improve quality and deployment readiness.

**Total Phases**: 3
**Estimated Time**: 20-25 minutes
**Risk Level**: Medium

---

## Phase 1: Docker Configuration
**Goal**: Containerize the application for consistent deployment

### Deliverables
- `Dockerfile` - Multi-stage build for production
- `docker-compose.yml` - Local development setup
- `.dockerignore` - Exclude unnecessary files

### Success Criteria
- [ ] Docker image builds successfully
- [ ] Container runs and serves the app
- [ ] Hot reload works in development

---

## Phase 2: Component Tests
**Goal**: Add unit tests for critical components

### Deliverables
- `src/components/ErrorBoundary.test.tsx`
- `src/lib/authStore.test.ts` (update)
- `src/pages/Home.test.tsx` (basic)

### Success Criteria
- [ ] Tests pass with `npm test`
- [ ] Coverage for error boundary
- [ ] Coverage for search logic

---

## Phase 3: API Tests
**Goal**: Add integration tests for API endpoints

### Deliverables
- `server/routes/auth.test.ts`
- `server/routes/forum.test.ts`

### Success Criteria
- [ ] Auth endpoints tested
- [ ] Forum CRUD tested
- [ ] All tests pass

---

## Final Verification
- [ ] All phases completed
- [ ] TypeScript type check passes
- [ ] All tests pass
- [ ] Docker builds successfully
