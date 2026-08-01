// Resilient Client-Side Deployment API Interceptor with Exponential Backoff
export interface RetryState {
  isRetrying: boolean;
  attempt: number;
  maxAttempts: number;
  nextDelayMs: number;
  lastError: string;
}

export interface FetchInterceptorOptions extends RequestInit {
  timeoutMs?: number;
  maxRetries?: number;
  baseDelayMs?: number;
  onRetry?: (state: RetryState) => void;
}

export async function fetchWithInterceptor<T = any>(
  url: string,
  options: FetchInterceptorOptions = {}
): Promise<{ data: T | null; error: string | null; attempts: number; isRecovered: boolean }> {
  const {
    timeoutMs = 8000,
    maxRetries = 3,
    baseDelayMs = 400,
    onRetry,
    ...fetchOpts
  } = options;

  let attempt = 0;
  let lastErrorMsg = 'Network request failed';

  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        error: null,
        attempts: attempt,
        isRecovered: attempt > 1
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        lastErrorMsg = `API Request Timeout (${timeoutMs}ms limit exceeded)`;
      } else {
        lastErrorMsg = err.message || 'SQS/API Connection Error';
      }

      if (attempt < maxRetries) {
        // Calculate exponential backoff with jitter
        const delay = Math.round(baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 100);

        if (onRetry) {
          onRetry({
            isRetrying: true,
            attempt,
            maxAttempts: maxRetries,
            nextDelayMs: delay,
            lastError: lastErrorMsg
          });
        }

        // Wait before next attempt
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  return {
    data: null,
    error: lastErrorMsg,
    attempts: attempt,
    isRecovered: false
  };
}
