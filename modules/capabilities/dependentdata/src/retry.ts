export interface RetryPolicy {
  baseDelay: number;       // Base delay in milliseconds
  maxDelay: number;        // Maximum delay in milliseconds
  backoffFactor: number;   // Factor by which the delay increases
  maxAttempts?: number;    // Optional maximum number of attempts
}
export const defaultRetryPolicy: RetryPolicy = {
  baseDelay: 200,
  maxDelay: 2000,
  backoffFactor: 2,
  maxAttempts: 5
}
export type IRetryTimingCalculator = ( attempts: number, policy: RetryPolicy ) => number

export const calculateNextRetryTime: IRetryTimingCalculator = ( attempts: number, policy: RetryPolicy ): number => {
  const jitter = Math.random () * 1000; // adding up to 1000 milliseconds of jitter
  let delay = policy.baseDelay * Math.pow ( policy.backoffFactor, attempts ) + jitter;
  const result = Math.min ( delay, policy.maxDelay );
  return Math.min ( delay, policy.maxDelay )
};