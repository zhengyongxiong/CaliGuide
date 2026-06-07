# Phase 5: Component Tests

## Objective
Add unit tests for critical React components.

## Tasks

### 5.1 Install Test Dependencies
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom
```

### 5.2 Create Test Setup
**File**: `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### 5.3 Update vite.config.ts
Add test configuration:

```typescript
export default defineConfig({
  // ... existing config
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### 5.4 Create ErrorBoundary Test
**File**: `src/components/ErrorBoundary.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders error UI when error occurs', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });
});
```

## Verification
- [ ] Tests pass: `npm test`
- [ ] ErrorBoundary tests work
