import type { CSSProperties } from 'react';
import type { RequestOptions } from './request';

export interface RequestFeedback {
  success: (message: string) => void;
  error: (message: string) => void;
  notifyError: (options: {
    message: string;
    description?: string;
    duration?: number;
    style?: CSSProperties;
  }) => void;
  confirm: (options: NonNullable<RequestOptions['confirmConfig']>) => Promise<boolean>;
}

let currentFeedback: RequestFeedback | null = null;

export function registerRequestFeedback(feedback: RequestFeedback): () => void {
  currentFeedback = feedback;
  return () => {
    if (currentFeedback === feedback) {
      currentFeedback = null;
    }
  };
}

export function getRequestFeedback(): RequestFeedback {
  return (
    currentFeedback ?? {
      success: (message) => window.alert(message),
      error: (message) => window.alert(message),
      notifyError: ({ message, description }) =>
        window.alert([message, description].filter(Boolean).join('\n')),
      confirm: async (options) => window.confirm(options.message),
    }
  );
}
