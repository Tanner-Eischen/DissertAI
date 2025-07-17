# Sapling Grammar API Integration

This document explains the Sapling grammar checker integration in the DissertAI writing assistant.

## Overview

Sapling is a powerful, AI-powered grammar checker that provides precise and consistent error detection through its REST API. It has been integrated into the DissertAI application to replace the previous Harper implementation.

## Features

- **Real-time Grammar Checking**: Instant feedback through API calls
- **Multiple Error Types**: Detects grammar, spelling, and punctuation issues
- **Smart Suggestions**: AI-powered contextual corrections
- **Performance Optimized**: Efficient API integration with caching
- **Cloud-based**: Leverages Sapling's powerful AI models
- **TypeScript Support**: Full type safety and IntelliSense

## Architecture

### Core Components

1. **`src/lib/sapling.ts`** - Main Sapling service implementation
- Singleton service for API communication
- Text processing and error detection via REST API
- Error classification and formatting
- Graceful error handling and retry logic

2. **`src/types/sapling.d.ts`** - TypeScript declarations for Sapling API
- Proper type definitions for Sapling API responses
- Interface definitions for errors and suggestions

3. **`src/components/SaplingTest.tsx`** - Test component for Sapling functionality
- Interactive testing interface
- Real-time error display
- Grammar checking demonstration

4. **`src/components/RichEditor.tsx`** - Rich text editor with grammar checking integration
- Rich text editor with highlight functionality
- Error visualization with tooltips
- Grammar correction workflows

### Sapling Service API

```typescript
// Initialize Sapling (called automatically)
await saplingService.initialize();

// Check text for errors
const errors = await saplingService.checkText("Your text here");

// Check if Sapling is available
const isReady = saplingService.isAvailable();
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
import { saplingService } from '@/lib/sapling';

const text = "This are a test sentence.";
const errors = await saplingService.checkText(text);
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

- **Graceful Degradation**: If Sapling fails to initialize, the app continues to work without grammar checking
- **Retry Logic**: Automatic retry on temporary failures
- **User Feedback**: Clear error messages when issues occur
- **Fallback**: Empty error array returned on failures to prevent crashes

## Performance Considerations

- **Debounced Checking**: 1-second delay after typing stops before checking
- **Lazy Initialization**: Sapling is only loaded when first needed
- **Efficient Updates**: Only re-highlights when errors change
- **Memory Management**: Proper cleanup of editor instances

## Troubleshooting

### Common Issues

1. **Sapling not initializing**
   - Check browser console for API connectivity
   - Ensure API keys are properly configured
   - Verify network connectivity for API requests

3. **TypeScript errors**
   - Ensure `src/types/sapling.d.ts` is included in tsconfig
   - Check that typeRoots includes the types directory

3. **Highlighting not working**
   - Verify that error positions are within text bounds
   - Check that TipTap editor is properly initialized
   - Ensure CSS styles are loaded

### Debug Mode

Enable debug logging by opening browser console. The Sapling service logs:
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

- Sapling API integration - Cloud-based grammar checking service
- `@tiptap/react`: Editor framework for highlighting
- `@tiptap/extension-highlight`: Text highlighting extension

## License

This integration uses the Sapling API service. See the [Sapling website](https://sapling.ai) for more details about their grammar checking service.