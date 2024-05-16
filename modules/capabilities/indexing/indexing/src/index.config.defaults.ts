import { indexThrottlePrototype, queryThrottlePrototype, treeRetryPolicy } from "./indexing.non.functionals";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";
import { IndexDefaults } from "@itsmworkbench/indexconfig";

export const configDefaults: IndexDefaults = {
  query: {
    retry: treeRetryPolicy,
    throttle: queryThrottlePrototype
  },
  auth: {
    method: 'ApiKey',
    credentials: {
      apiKey: '{name}_APIKEY'
    }
  },
  target: {
    retry: defaultRetryPolicy,
    throttle: indexThrottlePrototype,
    file: 'target/index/{source}/{name}_{num}.json',
    max: 10 * 1000 * 1000
  },
};