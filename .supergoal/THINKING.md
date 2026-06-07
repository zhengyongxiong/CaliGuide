# Deep Thinking - Risks & Dependencies

## Task Analysis
Implement 3 remaining P1 features for CaliGuide:
1. Error Boundary - React error handling
2. Unified Search - Cross-entity search
3. Forgot Password - Password reset flow

## Risks

### 1. Error Boundary
- **Risk**: Breaking existing component structure
- **Mitigation**: Wrap at app level, preserve existing error handling
- **Dependencies**: None

### 2. Unified Search
- **Risk**: API changes needed for combined search
- **Mitigation**: Use existing API endpoints, combine results client-side
- **Dependencies**: guidesApi.list(), forumApi.list()

### 3. Forgot Password
- **Risk**: No email service available
- **Mitigation**: Mock implementation with token-based reset
- **Dependencies**: authApi endpoints, database schema

## Best Practices

### Error Boundary
- Use React's built-in ErrorBoundary pattern
- Show user-friendly fallback UI
- Log errors for debugging
- Allow retry/reload

### Unified Search
- Debounce search input (already implemented)
- Show result type badges (Guide vs Forum)
- Handle empty states gracefully
- Maintain search history

### Forgot Password
- Generate secure reset tokens
- Expire tokens after 1 hour
- Validate email format
- Show success/error messages

## Implementation Strategy
1. **Phase 1**: Error Boundary (simplest, no API changes)
2. **Phase 2**: Unified Search (frontend only, uses existing APIs)
3. **Phase 3**: Forgot Password (requires new API endpoint)

## Verification Plan
- TypeScript type check after each phase
- Manual testing via dev server
- Check all i18n translations
