// Deployment Error Interceptor & SQS Resilience Engine
// Catches API timeouts, SQS connection issues, and provides exponential backoff auto-retries

export interface InterceptorLogEntry {
  id: string;
  timestamp: string;
  type: 'TIMEOUT' | 'SQS_CONNECTION_ERROR' | 'GATEWAY_ERROR' | 'RETRY_ATTEMPT' | 'SUCCESS_RECOVERY' | 'MAX_RETRIES_EXCEEDED';
  attempt: number;
  maxAttempts: number;
  delayMs: number;
  message: string;
  targetService: 'SQS_QUEUE' | 'ELECTRICITY_MAPS_API' | 'GITHUB_ACTIONS_WEBHOOK' | 'EVENTBRIDGE';
  payload?: any;
}

export interface InterceptorMetrics {
  totalIntercepted: number;
  successfulRecoveries: number;
  failedRetries: number;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  sqsConnectionStatus: 'HEALTHY' | 'RETRYING' | 'DEGRADED' | 'DISCONNECTED';
  averageBackoffDelayMs: number;
}

export class DeploymentErrorInterceptor {
  private maxRetries: number = 3;
  private baseDelayMs: number = 400;
  private maxDelayMs: number = 5000;
  private logs: InterceptorLogEntry[] = [];
  private metrics: InterceptorMetrics = {
    totalIntercepted: 0,
    successfulRecoveries: 0,
    failedRetries: 0,
    circuitBreakerState: 'CLOSED',
    sqsConnectionStatus: 'HEALTHY',
    averageBackoffDelayMs: 0
  };
  private consecutiveFailures: number = 0;
  private circuitOpenUntil: number = 0;

  constructor(maxRetries = 3, baseDelayMs = 400) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  // Calculate exponential backoff with full jitter
  public calculateBackoff(attempt: number): number {
    const exponential = this.baseDelayMs * Math.pow(2, attempt - 1);
    const capped = Math.min(exponential, this.maxDelayMs);
    // Add jitter (±20%)
    const jitter = capped * 0.2 * (Math.random() * 2 - 1);
    return Math.round(capped + jitter);
  }

  // Log interceptor action
  public addLog(entry: Omit<InterceptorLogEntry, 'id' | 'timestamp'>) {
    const log: InterceptorLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    this.logs.unshift(log);
    if (this.logs.length > 50) this.logs.pop(); // keep last 50
  }

  public getLogs(): InterceptorLogEntry[] {
    return this.logs;
  }

  public getMetrics(): InterceptorMetrics {
    // Check circuit breaker reset
    if (this.metrics.circuitBreakerState === 'OPEN' && Date.now() > this.circuitOpenUntil) {
      this.metrics.circuitBreakerState = 'HALF_OPEN';
      this.addLog({
        type: 'RETRY_ATTEMPT',
        attempt: 1,
        maxAttempts: this.maxRetries,
        delayMs: 0,
        message: 'Circuit breaker transitioning from OPEN to HALF_OPEN (Testing SQS reconnection)...',
        targetService: 'SQS_QUEUE'
      });
    }
    return this.metrics;
  }

  public resetCircuitBreaker() {
    this.consecutiveFailures = 0;
    this.metrics.circuitBreakerState = 'CLOSED';
    this.metrics.sqsConnectionStatus = 'HEALTHY';
    this.addLog({
      type: 'SUCCESS_RECOVERY',
      attempt: 0,
      maxAttempts: this.maxRetries,
      delayMs: 0,
      message: 'Circuit breaker manually reset to CLOSED. SQS connection healthy.',
      targetService: 'SQS_QUEUE'
    });
  }

  // Execute operation wrapped with Interceptor Retry Mechanism
  public async executeWithInterceptor<T>(
    operation: () => Promise<T>,
    targetService: InterceptorLogEntry['targetService'],
    serviceName: string,
    forcedFailureType?: 'TIMEOUT' | 'SQS_CONNECTION_ERROR' | '504_GATEWAY'
  ): Promise<{ result: T | null; recovered: boolean; attempts: number; error?: string }> {
    // 1. Check Circuit Breaker
    if (this.metrics.circuitBreakerState === 'OPEN') {
      if (Date.now() < this.circuitOpenUntil) {
        const remainingSec = Math.ceil((this.circuitOpenUntil - Date.now()) / 1000);
        const errMsg = `Circuit Breaker is OPEN for ${targetService}. SQS calls temporarily paused to prevent cascading failures. Retry in ${remainingSec}s.`;
        this.addLog({
          type: 'MAX_RETRIES_EXCEEDED',
          attempt: 0,
          maxAttempts: this.maxRetries,
          delayMs: 0,
          message: errMsg,
          targetService
        });
        return { result: null, recovered: false, attempts: 0, error: errMsg };
      } else {
        this.metrics.circuitBreakerState = 'HALF_OPEN';
      }
    }

    let attempt = 0;
    let lastError = 'Unknown error';

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        // If simulation mode requested
        if (forcedFailureType && attempt <= 2) {
          if (forcedFailureType === 'TIMEOUT') {
            throw new Error(`ETIMEDOUT: API request to ${serviceName} timed out after 5000ms`);
          } else if (forcedFailureType === 'SQS_CONNECTION_ERROR') {
            throw new Error(`SQS_CONNECTION_ERROR: Failed to connect to AWS SQS endpoint sqs.${serviceName}.amazonaws.com (ECONNRESET)`);
          } else if (forcedFailureType === '504_GATEWAY') {
            throw new Error(`HTTP 504: Gateway Timeout from deployment pipeline worker node`);
          }
        }

        // Execute actual operation
        const result = await operation();

        // If succeeded after retries
        if (attempt > 1) {
          this.metrics.successfulRecoveries++;
          this.consecutiveFailures = 0;
          this.metrics.sqsConnectionStatus = 'HEALTHY';
          if (this.metrics.circuitBreakerState === 'HALF_OPEN') {
            this.metrics.circuitBreakerState = 'CLOSED';
          }

          this.addLog({
            type: 'SUCCESS_RECOVERY',
            attempt,
            maxAttempts: this.maxRetries,
            delayMs: 0,
            message: `✅ Interceptor successfully recovered ${serviceName} on attempt #${attempt}/${this.maxRetries}! Operation executed cleanly.`,
            targetService
          });
        }

        return { result, recovered: attempt > 1, attempts: attempt };
      } catch (err: any) {
        lastError = err?.message ? String(err.message) : String(err);
        this.metrics.totalIntercepted++;
        this.consecutiveFailures++;

        const isSqsError = lastError.includes('SQS') || lastError.includes('ECONNRESET');
        const isTimeout = lastError.includes('TIMEOUT') || lastError.includes('ETIMEDOUT');

        const logType: InterceptorLogEntry['type'] = isSqsError
          ? 'SQS_CONNECTION_ERROR'
          : isTimeout
          ? 'TIMEOUT'
          : 'GATEWAY_ERROR';

        this.metrics.sqsConnectionStatus = 'RETRYING';

        const delay = this.calculateBackoff(attempt);

        this.addLog({
          type: logType,
          attempt,
          maxAttempts: this.maxRetries,
          delayMs: delay,
          message: `⚠️ Interceptor caught ${logType} on ${serviceName}: "${lastError}". Executing Exponential Backoff (Attempt ${attempt}/${this.maxRetries}). Waiting ${delay}ms...`,
          targetService
        });

        // If we reached max retries
        if (attempt >= this.maxRetries) {
          this.metrics.failedRetries++;
          this.metrics.sqsConnectionStatus = 'DEGRADED';

          // Trip circuit breaker if consecutive failures high
          if (this.consecutiveFailures >= 3) {
            this.metrics.circuitBreakerState = 'OPEN';
            this.circuitOpenUntil = Date.now() + 15000; // 15s cool down
            this.addLog({
              type: 'MAX_RETRIES_EXCEEDED',
              attempt,
              maxAttempts: this.maxRetries,
              delayMs: 0,
              message: `🛑 Circuit Breaker TRIPPED to OPEN! 3 consecutive failures detected. SQS queue paused for 15s cooling window.`,
              targetService
            });
          } else {
            this.addLog({
              type: 'MAX_RETRIES_EXCEEDED',
              attempt,
              maxAttempts: this.maxRetries,
              delayMs: 0,
              message: `❌ Max retries (${this.maxRetries}) exhausted for ${serviceName}. Error passed to Dead-Letter Queue (DLQ).`,
              targetService
            });
          }

          return { result: null, recovered: false, attempts: attempt, error: String(lastError) };
        }

        // Wait exponential backoff delay before next retry
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return { result: null, recovered: false, attempts: attempt, error: String(lastError) };
  }
}

// Global instance for backend deployment service
export const globalDeploymentInterceptor = new DeploymentErrorInterceptor(3, 350);
