import { RetryPolicyConfig, Throttling } from "@itsmworkbench/kleislis";

export type IndexTreeNonFunctionals = {
  concurrencyLimit: number;
  queryThrottle: Throttling;
  queryRetryPolicy: RetryPolicyConfig;
  indexThrottle: Throttling;
  prepareLeafRetryPolicy: RetryPolicyConfig;
  indexRetryPolicy: RetryPolicyConfig;
}

export function defaultIndexTreeNfs (): IndexTreeNonFunctionals {
  const queryThrottle: Throttling = { current: 0, max: 50, throttlingDelay: 50, tokensPer100ms: 0.3 } //maybe a bit fast. per hour this is 12000. That's my personal cap I think
  const indexThrottle: Throttling = { current: 0, max: 500, throttlingDelay: 50, tokensPer100ms: 1 } //This is 10 per second. I can't see it mattering much as this is ten times query limit
  const retryPolicy: RetryPolicyConfig = {
    initialInterval: 5000,
    maximumInterval: 30000,
    maximumAttempts: 50, //we do want to get there. This is a seriously slow retry. We have a decent throttling policy.I think this is OK and not abusive
  }
  return {
    concurrencyLimit: 1000,
    queryThrottle,
    queryRetryPolicy: retryPolicy,
    indexThrottle,
    prepareLeafRetryPolicy: retryPolicy,
    indexRetryPolicy: retryPolicy
  }
}