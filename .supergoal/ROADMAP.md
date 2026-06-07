# CaliGuide P1 Features - Roadmap

## Overview
Implement 3 remaining P1 priority features to complete the core experience.

**Total Phases**: 3
**Estimated Time**: 15-20 minutes
**Risk Level**: Low (frontend-focused, minimal API changes)

---

## Phase 1: Error Boundary
**Goal**: Prevent white screens by catching React errors gracefully

### Deliverables
- `src/components/ErrorBoundary.tsx` - Error boundary component
- Wrap `App.tsx` with error boundary
- User-friendly fallback UI with retry button
- Error logging for debugging

### Success Criteria
- [ ] TypeScript compiles without errors
- [ ] Error boundary catches component crashes
- [ ] Fallback UI displays correctly
- [ ] Retry button reloads the app

---

## Phase 2: Unified Search
**Goal**: Search both guides and forum posts from a single search bar

### Deliverables
- Update `Home.tsx` to search guides AND forum posts
- Show result type badges (Guide vs Forum)
- Click results to navigate to correct page
- Handle empty states

### Success Criteria
- [ ] TypeScript compiles without errors
- [ ] Search returns results from both sources
- [ ] Results show type badges
- [ ] Clicking guide result navigates to guide
- [ ] Clicking forum result navigates to forum post

---

## Phase 3: Forgot Password
**Goal**: Allow users to reset their password via email (mock implementation)

### Deliverables
- New API endpoint: `POST /api/auth/forgot-password`
- New API endpoint: `POST /api/auth/reset-password`
- Database table: `password_resets` (user_id, token, expires_at)
- Frontend: Forgot password form in AuthPage
- Frontend: Reset password form
- i18n translations for all 5 languages

### Success Criteria
- [ ] TypeScript compiles without errors
- [ ] Forgot password form submits email
- [ ] Reset token generated and stored
- [ ] Reset password form validates token
- [ ] Password updated successfully
- [ ] All i18n translations complete

---

## Final Verification
- [ ] All phases completed
- [ ] TypeScript type check passes
- [ ] No console errors
- [ ] All features work end-to-end
- [ ] i18n translations complete
