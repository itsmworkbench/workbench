import { RetryPolicyConfig, Task, Throttling } from "@itsmworkbench/kleislis";
import { PopulatedIndexItem } from "@itsmworkbench/indexconfig";

export type IndexTreeNonFunctionals = {
  queryQueue: Task<any>[];
  queryConcurrencyLimit: number;
  queryThrottle: Throttling;
  queryRetryPolicy: RetryPolicyConfig;
  indexQueue: Task<any>[];
  indexThrottle: Throttling;
  prepareLeafRetryPolicy: RetryPolicyConfig;
  indexRetryPolicy: RetryPolicyConfig;
  indexerConcurrencyLimit: number;
}

export function treeNonFunctionalsFromConfig ( indexItem: PopulatedIndexItem ): IndexTreeNonFunctionals {
  return {
    queryQueue: [],
    queryConcurrencyLimit: indexItem.query.concurrencyLimit || 1000,
    queryThrottle: indexItem.query.throttle,
    queryRetryPolicy: indexItem.query.retry,
    indexQueue: [],
    indexThrottle: indexItem.target.throttle,
    prepareLeafRetryPolicy: indexItem.target.retry,
    indexRetryPolicy: indexItem.target.retry,
    indexerConcurrencyLimit: indexItem.target.concurrencyLimit
  }
}

export function treeNonFunctionals ( queryThrottle: Throttling, retryPolicy: RetryPolicyConfig, indexThrottle: Throttling, concurrencyLimit: number = 1000, indexerConcurrencyLimit: number = 2 ): IndexTreeNonFunctionals {
  return {
    queryQueue: [],
    queryConcurrencyLimit: concurrencyLimit,
    queryThrottle,
    queryRetryPolicy: retryPolicy,
    indexerConcurrencyLimit,
    indexQueue: [],
    indexThrottle,
    prepareLeafRetryPolicy: retryPolicy,
    indexRetryPolicy: retryPolicy
  }
}
//mostly for testing, or if we don't have a config file
export const queryThrottlePrototype: Throttling = { current: 0, max: 50, throttlingDelay: 50, tokensPer100ms: 0.3 } //maybe a bit fast. per hour this is 12000. That's my personal cap I think
export const indexThrottlePrototype: Throttling = { current: 0, max: 500, throttlingDelay: 50, tokensPer100ms: 1 } //This is 10 per second. I can't see it mattering much as this is ten times query limit
export const treeRetryPolicy: RetryPolicyConfig = {
  initialInterval: 5000,
  maximumInterval: 30000,
  maximumAttempts: 50, //we do want to get there. This is a seriously slow retry. We have a decent throttling policy.I think this is OK and not abusive
  nonRecoverableErrors: [ 'Not Found' ]
}
export function defaultIndexTreeNfs (): IndexTreeNonFunctionals {
  return treeNonFunctionals ( { ...queryThrottlePrototype }, treeRetryPolicy, { ...indexThrottlePrototype } );
}