# Phase 1: Error Boundary

## Objective
Implement React Error Boundary to prevent white screens when components crash.

## Tasks

### 1.1 Create ErrorBoundary Component
**File**: `src/components/ErrorBoundary.tsx`

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-error" />
            </div>
            <h2 className="text-xl font-bold text-on-surface mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-on-surface-variant mb-6">
              We're sorry, but something unexpected happened. Please try reloading the page.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center justify-center gap-2 mx-auto bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              <RefreshCw size={18} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 1.2 Wrap App with Error Boundary
**File**: `src/main.tsx`

Add ErrorBoundary wrapper around App component.

### 1.3 Add i18n Translations
Add error boundary text to all 5 language files.

## Verification
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Error boundary catches errors
- [ ] Fallback UI displays correctly
- [ ] Retry button works
