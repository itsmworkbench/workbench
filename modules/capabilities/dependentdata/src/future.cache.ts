import { callListeners, PromiseCacheListener } from "@itsmworkbench/utils";
import { calculateNextRetryTime, defaultRetryPolicy, IRetryTimingCalculator, RetryPolicy } from "./retry";
import { HasDDMetrics, incrementMetric, MetricName } from "./metrics";


/** This cache is written assuming that there won't be that many calls at once. It's for the dependant data. Thus a linear search for the params */

export type PromiseStatus = undefined | 'fulfilled' | 'rejected'


export interface CallStatus<Context> extends HasDDMetrics {
  context: Context
  params: any[]
  value: Promise<any> | undefined //during the lifecycle when this begins it is undefined
  time: number
  valueStatus?: PromiseStatus
}
export interface CacheSearch<Context> {
  ( cache: CallStatus<any>[], context: Context, params: any[] ): CallStatus<Context> | undefined;
}
export const defaultCacheSearch = <Context> (): CacheSearch<Context> =>
  ( cache, context, params ) =>
    cache.find ( c => c.context === context && shallowCompareArrays ( c.params, params ) )

export type  CacheCleanup<Context> = ( cache: FutureCache<Context> ) => CallStatus<Context>[];

export const defaultCacheCleanup = <Context> (): CacheCleanup<Context> => ( cache ) => {
  if ( !cache.ttl ) return cache.cache;
  const deadBefore = cache.timeService () - cache.ttl
  return cache.cache.filter ( c => c.time >= deadBefore );
}

export type UpdateValueStatus = ( status: PromiseStatus ) => void
export type CacheExecuteAsync<Context> =
  ( cache: FutureCache<Context>, callStatus: CallStatus<Context>, raw: ( params: any[] ) => Promise<any> ) => Promise<any>

export const defaultCacheExecuteAsync = <Context> (): CacheExecuteAsync<Context> =>
  async ( cache, callStatus, raw ) => {
    const { params, context } = callStatus
    callStatus.valueStatus = undefined
    incrementMetric ( callStatus, 'attempts' )
    callListeners ( cache.listeners, 'callingLoad', l => l.callingLoad ( context ) )
    const result = raw ( params ).then ( res => {
      incrementMetric ( callStatus, 'successes' )
      callListeners ( cache.listeners, 'loadArrived', l => l.loadArrived ( context, res ) )
      callStatus.valueStatus = 'fulfilled'
      return res
    } ).catch ( e => {
      callStatus.valueStatus = 'rejected'
      incrementMetric ( callStatus, 'failures' )
      callListeners ( cache.listeners, 'loadError', l => l.loadError ( context, e ) )
      throw e
    } )
    return result
  }

export type CacheFound<Context> = ( cache: FutureCache<Context>, context: Context, found: CallStatus<Context> ) => Promise<any>
export const defaultCacheFound = <Context> (): CacheFound<Context> => ( cache: FutureCache<Context>, context: Context, found: CallStatus<Context> ) => {
  callListeners ( cache.listeners, 'duplicateCall', l => l.duplicateCall ( context ) )
  found.time = cache.timeService ()
  return found.value
};
export interface FutureCache<Context> {
  ttl?: number
  policy: RetryPolicy
  timeService: () => number
  listeners: PromiseCacheListener<Context, any>[]
  cache: CallStatus<any>[]
  found: CacheFound<Context>
  search: CacheSearch<Context>
  cleanup: CacheCleanup<Context>
  execute: CacheExecuteAsync<Context>
  retryTime: IRetryTimingCalculator
}
export function futureCache<Context> (): FutureCache<Context> {
  return {
    ttl: 20000, //  seconds
    policy: defaultRetryPolicy,
    timeService: () => Date.now (),
    listeners: [],
    cache: [],
    found: defaultCacheFound (),
    search: defaultCacheSearch (),
    cleanup: defaultCacheCleanup (),
    execute: defaultCacheExecuteAsync (),
    retryTime: calculateNextRetryTime
  }
}

function shallowCompareArrays ( arr1: any[], arr2: any[] ) {
  if ( arr1.length !== arr2.length ) return false; // Different lengths, definitely not equal
  for ( let i = 0; i < arr1.length; i++ )
    if ( arr1[ i ] !== arr2[ i ] ) return false;
  return true;
}


/**
 * Retrieves data from cache or fetches it using a provided function if not present.
 * If data is found in the cache and still within its TTL, returns the cached promise.
 * If not found or expired, fetches new data, caches and returns the resulting promise.
 * Errors during fetch are logged and rethrown, to be handled by the caller.
 *
 * @param {FutureCache<Context>} cache - The cache object containing all cached calls and configurations.
 * @param {Context} context - The context in which the cache entry is used, for contextual uniqueness.
 * @param {any[]} params - The parameters used for the cache key and to fetch data if necessary.
 * @param {(params: any[]) => Promise<any>} raw - Function to fetch data if not present in the cache.
 * @returns {Promise<any>} A promise resolving to the fetched or cached data.
 */

export async function getOrUpdateFromFutureCache<Context> ( cache: FutureCache<Context>,
                                                            context: Context,
                                                            params: any[],
                                                            raw: ( params: any[] ) => Promise<any>,
                                                            retryPolicy?: RetryPolicy ): Promise<any> {
  const { cleanup, search, found } = cache
  cache.cache = cleanup ( cache )
  let callStatus: CallStatus<Context> | undefined = search ( cache.cache, context, params )
  // console.log ( 'callStatus', callStatus )
  if ( callStatus && callStatus.valueStatus !== 'rejected' ) {
    incrementMetric ( callStatus, 'cacheHits' )
    return found ( cache, context, callStatus )
  }
  const now = cache.timeService ()
  const retryTime = cache.retryTime ( 1, retryPolicy || cache.policy || defaultRetryPolicy )
  // console.log ( 'retrying evaluated', callStatus && now - (callStatus.time + retryTime) )
  if ( callStatus && now > callStatus.time + retryTime ) {
    incrementMetric ( callStatus, 'retryAttempts' )
    return found ( cache, context, callStatus )
  }

  const resultCallStatus = callStatus ? callStatus : { context, params, value: undefined, time: now }
  resultCallStatus.time = now
  if ( !callStatus ) cache.cache.push ( resultCallStatus )
  const result = cache.execute ( cache, resultCallStatus, raw )
  return result
}

