# CaliGuide P3 Features - Roadmap

## Overview
Implement P3 priority features for content moderation and user feedback.

**Total Phases**: 3
**Estimated Time**: 25-30 minutes
**Risk Level**: Medium

---

## Phase 1: Admin Role & Dashboard
**Goal**: Add admin role and basic moderation dashboard

### Deliverables
- Add `role` column to users table (user/admin)
- Admin middleware for protected routes
- Admin dashboard page with stats
- Flag/report functionality for posts

### Success Criteria
- [ ] Admin role stored in database
- [ ] Admin-only routes protected
- [ ] Dashboard shows moderation stats
- [ ] Users can report posts

---

## Phase 2: Content Moderation
**Goal**: Implement post/reply moderation workflow

### Deliverables
- Report/flag API endpoints
- Moderation queue for admins
- Hide/delete reported content
- User warning system

### Success Criteria
- [ ] Posts can be reported
- [ ] Admins see moderation queue
- [ ] Reported content can be hidden/deleted
- [ ] Users receive warnings

---

## Phase 3: User Feedback System
**Goal**: Collect and manage user feedback

### Deliverables
- Feedback form component
- Feedback API endpoints
- Feedback storage in database
- Admin view for feedback

### Success Criteria
- [ ] Users can submit feedback
- [ ] Feedback stored in database
- [ ] Admins can view feedback
- [ ] Feedback categories work

---

## Final Verification
- [ ] All phases completed
- [ ] TypeScript type check passes
- [ ] All tests pass
- [ ] Admin features work end-to-end
