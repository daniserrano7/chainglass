# Error Handling & Error Boundaries

This document describes the comprehensive error handling system implemented in ChainGlass.

## Overview

ChainGlass now has a multi-layered error handling strategy:

1. **React Error Boundaries** - Catch and handle React component errors
2. **API Error Handling** - Standardized error responses from API routes
3. **Service Layer Retry Logic** - Automatic retry with exponential backoff
4. **User-Friendly Error UI** - Clear error messages and recovery options

## Components

### ErrorBoundary Component

**Location:** `app/components/ErrorBoundary.tsx`

A reusable React error boundary that catches errors in child components and displays a fallback UI.

**Features:**
- Custom fallback UI support
- Development-only error details
- Optional error callback
- Automatic page reload option

**Usage:**

```tsx
import { ErrorBoundary } from "~/components/ErrorBoundary";

// With default fallback
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary
  fallback={
    <div className="error-message">
      Custom error UI
    </div>
  }
>
  <YourComponent />
</ErrorBoundary>

// With error callback
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error("Error caught:", error, errorInfo);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### ErrorDisplay Component

**Location:** `app/components/ErrorDisplay.tsx`

A reusable inline error display component for showing errors within the UI.

**Features:**
- Dismissible errors
- Retry functionality
- Custom titles
- Consistent styling

**Usage:**

```tsx
import { ErrorDisplay } from "~/components/ErrorDisplay";

<ErrorDisplay
  error={error}
  onDismiss={() => setError(null)}
  onRetry={() => retryOperation()}
  title="Failed to load data"
/>
```

## API Error Handling

### API Error Utilities

**Location:** `app/lib/utils/api-error.ts`

Provides standardized error handling for API routes.

**Classes:**
- `ApiError` - Custom error class with status codes
- `handleApiError()` - Standardized error response handler
- `createValidationError()` - Helper for 400 errors
- `createNotFoundError()` - Helper for 404 errors
- `createServerError()` - Helper for 500 errors

**Usage in API Routes:**

```typescript
import {
  handleApiError,
  createValidationError,
} from "~/lib/utils/api-error";

export async function loader({ params }: LoaderFunctionArgs) {
  try {
    if (!params.id) {
      throw createValidationError("Missing required parameter: id");
    }

    // Your logic here

    return Response.json(data);
  } catch (error) {
    return handleApiError(error);
  }
}
```

**Benefits:**
- Consistent error response format
- Automatic status code handling
- Development-only error details
- Better error messages

## Service Layer Error Handling

### Retry Logic with Exponential Backoff

**Location:** `app/lib/services/api-client.ts`

The `fetchWithRetry()` function provides automatic retry with exponential backoff for network requests.

**Features:**
- 3 retry attempts by default
- 30-second timeout per request
- Exponential backoff (1s, 2s, 4s)
- Better error messages from response bodies

**Configuration:**
- Max retries: 3
- Timeout: 30 seconds
- Backoff strategy: 2^attempt * 1000ms

### RPC Error Handling

**Location:** `app/lib/services/rpc.ts`

RPC calls already have built-in retry logic via viem client:
- 3 retry attempts
- 1-second retry delay
- 30-second timeout

## Error Boundaries Placement

Error boundaries are strategically placed throughout the application:

1. **Root Level** (`app/root.tsx`)
   - Catches all unhandled React errors
   - Provides full-page error UI
   - Last line of defense

2. **Component Level** (`app/routes/_index.tsx`)
   - Portfolio Summary
   - Add Address Form
   - Network Manager
   - Token Manager
   - Address Cards List

Each boundary has a custom fallback that explains what failed, allowing the rest of the app to continue functioning.

## Error Recovery

### User Actions

All error displays provide recovery options:

1. **Dismiss** - Clear the error message
2. **Retry** - Attempt the operation again
3. **Reload** - Reload the page (for critical errors)

### Automatic Recovery

- API requests retry automatically with exponential backoff
- RPC calls retry up to 3 times
- Network errors are handled gracefully

## Error States

The application handles these error scenarios:

### Network Errors
- Timeout after 30 seconds
- Retry with exponential backoff
- User-friendly timeout messages

### API Errors
- 400 - Validation errors with helpful messages
- 404 - Not found errors
- 500 - Server errors with details (dev only)

### RPC Errors
- Failed balance fetches
- Contract read failures
- Network connectivity issues

### Component Errors
- React rendering errors
- State update errors
- Child component failures

## Development vs Production

### Development Mode
- Full error stack traces
- Error details in API responses
- Console error logging
- Detailed error boundaries

### Production Mode
- Generic error messages
- No stack traces exposed
- Error details hidden
- User-friendly messages only

## Best Practices

1. **Always wrap risky operations in try/catch**
   ```typescript
   try {
     await riskyOperation();
   } catch (error) {
     setError(error instanceof Error ? error.message : "Unknown error");
   }
   ```

2. **Use error boundaries for component isolation**
   - Prevents entire app crashes
   - Provides targeted error recovery
   - Better user experience

3. **Provide actionable error messages**
   - Tell users what went wrong
   - Suggest how to fix it
   - Offer retry options

4. **Log errors appropriately**
   - Development: Full details
   - Production: Sanitized messages
   - Consider error tracking service

5. **Handle errors at the right level**
   - Validation: API route level
   - Network: Service layer
   - Rendering: Error boundaries

## Testing Error Handling

To test error handling:

1. **Network Errors**
   - Disconnect network
   - Test timeout behavior
   - Verify retry logic

2. **API Errors**
   - Send invalid data
   - Test validation errors
   - Check error messages

3. **Component Errors**
   - Trigger React errors
   - Verify boundary catches
   - Check fallback UI

4. **Recovery**
   - Test retry buttons
   - Verify error dismissal
   - Check page reload

## Future Improvements

Potential enhancements for error handling:

1. **Error Tracking Service**
   - Integrate Sentry or similar
   - Track error rates
   - Monitor error patterns

2. **Circuit Breaker Pattern**
   - Stop retrying after threshold
   - Prevent cascading failures
   - Faster failure detection

3. **Offline Support**
   - Detect offline state
   - Queue operations
   - Sync when online

4. **Better Error Analytics**
   - Track error frequencies
   - Identify problem areas
   - User impact metrics

5. **Toast Notifications**
   - Non-blocking error messages
   - Success confirmations
   - Action completion feedback
