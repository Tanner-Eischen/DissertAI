# Design Document

## Overview

This design addresses the critical issues preventing the DissertAI Writing Assistant from running properly. The application has solid architecture but requires targeted fixes for TypeScript compilation errors, component prop type mismatches, and integration issues. The design focuses on minimal, surgical changes to preserve the existing architecture while resolving blocking issues.

## Architecture

The existing architecture is sound and will be preserved:

- **Frontend**: React 18 with TypeScript, TipTap rich editor, Tailwind CSS
- **State Management**: Zustand stores for auth and document management  
- **Backend**: Supabase for authentication and document storage
- **AI Services**: Sapling API for grammar checking, OpenAI API for other tools
- **Build System**: Vite with TypeScript path mapping

### Current Issues Analysis

1. **TypeScript Compilation Errors**: Missing type definitions and incorrect type annotations
2. **Component Integration**: Prop type mismatches between parent and child components
3. **State Management**: Inconsistent error state handling and potential re-render loops
4. **API Integration**: Mixed patterns and error handling inconsistencies

## Components and Interfaces

### Type System Fixes

#### Node.js Types Integration
```typescript
// Add @types/node dependency for NodeJS.Timeout
// Update GrammarChecker component to use proper timer typing
```

#### Error Handling Types
```typescript
// Standardize error handling with proper type guards
interface AppError {
  message: string;
  stack?: string;
  code?: string;
}

// Type guard for error objects
function isError(error: unknown): error is Error {
  return error instanceof Error;
}
```

#### Component Prop Interfaces
```typescript
// RichEditor props - make value optional with default
interface RichEditorProps {
  value?: string; // Changed from required to optional
  onChange: (text: string) => void;
  highlights?: GrammarError[]; // Ensure consistent with GrammarError type
  onApplyFix?: (start: number, end: number, correction: string) => void;
}

// Grammar error interface - ensure consistency
interface GrammarError {
  start: number;
  end: number;
  type: 'grammar' | 'spelling' | 'punctuation';
  message: string;
  incorrect: string;
  correction: string;
}
```

### Component Integration Design

#### RichEditor Component
- **Issue**: Undefined value handling
- **Solution**: Default empty string for undefined values, proper null checks
- **Implementation**: Add default parameter and conditional rendering

#### GrammarChecker Integration  
- **Issue**: Type mismatch between error states and highlight props
- **Solution**: Ensure consistent GrammarError interface usage across components
- **Implementation**: Update type definitions and prop passing

#### Editor Page State Management
- **Issue**: Complex state interactions causing type errors
- **Solution**: Simplify state flow and add proper error boundaries
- **Implementation**: Refactor error handling with type guards

## Data Models

### Existing Models (Preserved)
```typescript
// Document model - no changes needed
interface Document {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

// Auth user model - no changes needed  
type User = any; // Supabase user type
```

### Enhanced Error Models
```typescript
// Standardized error handling
interface ComponentError {
  component: string;
  message: string;
  timestamp: Date;
  recoverable: boolean;
}

// API error responses
interface ApiErrorResponse {
  error: string;
  details?: string;
  code?: number;
}
```

## Error Handling

### TypeScript Error Resolution Strategy

1. **Missing Dependencies**: Add @types/node for NodeJS namespace
2. **Type Annotations**: Add proper type guards for error handling
3. **Optional Props**: Make RichEditor value prop optional with defaults
4. **Interface Consistency**: Align GrammarError interface across all components

### Runtime Error Handling

#### Component Level
- Add error boundaries for AI tool components
- Implement graceful degradation for API failures
- Add loading states and error messages

#### API Integration
- Standardize error response handling
- Add retry logic for transient failures
- Implement proper timeout handling

### Error Recovery Patterns
```typescript
// Error boundary pattern for AI tools
class AIToolErrorBoundary extends React.Component {
  // Handle component errors gracefully
  // Display fallback UI for failed tools
  // Log errors for debugging
}

// API error handling pattern
async function handleApiCall<T>(
  apiCall: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error('API call failed:', error);
    return fallback;
  }
}
```

## Testing Strategy

### TypeScript Validation
- Run `npm run type-check` to verify all compilation errors are resolved
- Ensure no new TypeScript errors are introduced
- Validate all component prop interfaces match usage

### Component Integration Testing
- Test RichEditor with various content states (empty, undefined, populated)
- Verify grammar checking integration works end-to-end
- Test all AI tool components load and function properly

### Error Handling Validation
- Test error scenarios for each API integration
- Verify graceful degradation when services are unavailable
- Ensure no unhandled promise rejections or console errors

### User Flow Testing
- Complete document creation and editing workflow
- Test grammar checking with real text input
- Verify save/load functionality works properly
- Test authentication flow and protected routes

## Implementation Approach

### Phase 1: TypeScript Fixes (Priority 1)
1. Install missing @types/node dependency
2. Fix error handling type annotations
3. Update RichEditor prop interface
4. Resolve highlight prop type mismatch

### Phase 2: Component Integration (Priority 2)  
1. Fix RichEditor undefined value handling
2. Align GrammarError interfaces across components
3. Update Editor page error handling
4. Test component communication

### Phase 3: Validation and Testing (Priority 3)
1. Run comprehensive TypeScript validation
2. Test all user workflows
3. Verify AI tool functionality
4. Validate error handling scenarios

### Rollback Strategy
- Each fix will be implemented incrementally
- Git commits for each resolved error
- Ability to revert individual changes if issues arise
- Preserve existing functionality while fixing bugs

## Security Considerations

### Existing Security Issues (Noted but not addressed in this spec)
- OpenAI API key exposed client-side (requires separate architectural change)
- Supabase configuration should be validated

### Error Handling Security
- Ensure error messages don't expose sensitive information
- Validate API responses before processing
- Sanitize user input in error logging

## Performance Considerations

### Optimization Opportunities
- Debounce grammar checking to reduce API calls (already implemented)
- Implement proper cleanup in useEffect hooks
- Avoid unnecessary re-renders in Editor component

### Memory Management
- Ensure proper cleanup of timers and subscriptions
- Handle component unmounting gracefully
- Prevent memory leaks in long-running sessions