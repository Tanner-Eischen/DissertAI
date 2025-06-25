// Sapling API type definitions
// This file maintains the same name for backward compatibility

export interface SaplingEdit {
  id: string;
  sentence_start: number;
  sentence_end: number;
  start: number;
  end: number;
  replacement: string;
  error_type: string;
  general_error_type: string;
}

export interface SaplingResponse {
  edits: SaplingEdit[];
}

export interface SaplingError {
  start: number;
  end: number;
  message: string;
  type: 'grammar' | 'spelling' | 'punctuation';
  incorrect: string;
  correction: string;
}

// Legacy types for backward compatibility
export type HarperError = SaplingError;

export interface SaplingApiRequest {
  key: string;
  text: string;
  session_id: string;
  lang?: string;
  auto_apply?: boolean;
  find_new_errors?: boolean;
}