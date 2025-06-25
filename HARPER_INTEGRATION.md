# Sapling Grammar API Integration

This document explains the Sapling grammar checker integration in the Word-Wise writing assistant.

## Overview

Sapling is a powerful, AI-powered grammar checker that provides precise and consistent error detection through its REST API. It has been integrated into the Word-Wise application to replace the previous Harper implementation.

## Features

- **Real-time Grammar Checking**: Instant feedback through API calls
- **Multiple Error Types**: Detects grammar, spelling, and punctuation issues
- **Smart Suggestions**: AI-powered contextual corrections
- **Performance Optimized**: Efficient API integration with caching
- **Cloud-based**: Leverages Sapling's powerful AI models
- **TypeScript Support**: Full type safety and IntelliSense

## Architecture

### Core Components

1. **`src/lib/harper.ts`** - Main Sapling service implementation (renamed for compatibility)
- Singleton service for API communication
- Text processing and error detection via REST API
- Error classification and formatting
- Graceful error handling and retry logic

2. **`src/types/harper.d.ts`** - TypeScript declarations for Sapling API
- Proper type definitions for Sapling API responses
- Interface definitions for errors and suggestions

3. **`src/components/HarperTest.tsx`** - Test component for Sapling functionality
- Interactive testing interface
- Real-time error display
- Grammar checking demonstration

4. **`src/examples/HarperExample.tsx`** - Usage examples and integration patterns
- Rich text editor integration
- Highlight and tooltip functionality
- Error correction workflows

### Sapling Service API

```typescript
// Initialize Sapling (called automatically)
await harperService.initialize();

// Check text for errors
const errors = await harperService.checkText("Your text here");

// Check if Sapling is available
const isReady = harperService.isAvailable();
```

### Error Interface

```typescript
interface SaplingError {
  start: number;        // Character position where error starts
  end: number;          // Character position where error ends
  message: string;      // Human-readable error description
  type: 'grammar' | 'spelling' | 'punctuation'; // Error category
  incorrect: string;    // The incorrect text
  correction: string;   // Suggested correction
}

// Legacy alias for backward compatibility
type HarperError = SaplingError;
```

## Usage Examples

### Basic Text Checking

```typescript
import { harperService } from '@/lib/harper';

const text = "This are a test sentence.";
const errors = await harperService.checkText(text);
console.log(errors); // Array of SaplingError objects
```

### Testing Sapling Integration

1. Click on the "Sapling Test" tab in the AI tools panel
2. Enter text in the textarea
3. Click "Check Grammar" to see Sapling's analysis
4. Review detected errors with suggestions
5. Click "Apply Fix" to automatically correct errors

## Configuration

Sapling is configured with:

- **API Endpoint**: https://api.sapling.ai/api/v1/edits
- **Language**: English (en)
- **Auto Apply**: Disabled (manual corrections)
- **Find New Errors**: Enabled for comprehensive checking

## API Keys

The integration uses pre-configured API keys:
- **Public Key**: Used for API authentication
- **Private Key**: Stored securely for enhanced features

⚠️ **Security Note**: In production, API keys should be stored as environment variables and not hardcoded.

## Error Handling

The integration includes robust error handling:

- **Graceful Degradation**: If Harper fails to initialize, the app continues to work without grammar checking
- **Retry Logic**: Automatic retry on temporary failures
- **User Feedback**: Clear error messages when issues occur
- **Fallback**: Empty error array returned on failures to prevent crashes

## Performance Considerations

- **Debounced Checking**: 1-second delay after typing stops before checking
- **Lazy Initialization**: Harper is only loaded when first needed
- **Efficient Updates**: Only re-highlights when errors change
- **Memory Management**: Proper cleanup of editor instances

## Troubleshooting

### Common Issues

1. **Harper not initializing**
   - Check browser console for WebAssembly support
   - Ensure harper.js package is properly installed
   - Verify network connectivity for binary loading

2. **TypeScript errors**
   - Ensure `src/types/harper.d.ts` is included in tsconfig
   - Check that typeRoots includes the types directory

3. **Highlighting not working**
   - Verify that error positions are within text bounds
   - Check that TipTap editor is properly initialized
   - Ensure CSS styles are loaded

### Debug Mode

Enable debug logging by opening browser console. The Harper service logs:
- Initialization status
- Error detection results
- Performance metrics
- Failure reasons

## Future Enhancements

- **Custom Dictionaries**: Add domain-specific vocabulary
- **Writing Style Analysis**: Detect passive voice, readability issues
- **Multi-language Support**: Support for other dialects and languages
- **Performance Optimization**: Web Worker integration for large documents
- **Advanced Rules**: Custom grammar rules for specific writing styles

## Dependencies

- `harper.js`: ^0.44.0 - Core Harper grammar checker
- `@tiptap/react`: Editor framework for highlighting
- `@tiptap/extension-highlight`: Text highlighting extension

## License

Harper is licensed under the Apache License 2.0. See the [Harper repository](https://github.com/elijah-potter/harper) for more details.