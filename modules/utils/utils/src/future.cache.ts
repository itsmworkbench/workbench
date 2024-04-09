
import { callListeners } from "./listeners";
import { NameAnd } from "@laoban/utils";
import { Optional } from "@focuson/lens";

export interface PromiseCacheListener<Context, Result> {
  duplicateCall?: ( context: Context ) => void
  callingLoad?: ( context: Context ) => void
  loadAborted?: ( context: Context ) => void
  loadArrived?: ( context: Context, result: Result ) => void
  loadAbandoned?: ( context: Context, reason: string ) => void
  loadError?: ( context: Context, e: any ) => void
}


/** So this only caches during the actually query
 * It has two keys, and the promise is the value
 * When the query finishes it removes the promise from the cache
 * This is mostly for situations like 'terraform'
 *
 * We want to be able to compare 'desired' to 'actual'. But it takes time to do this. While that time is happening we don't want to do it again! So we return the
 * current promise.
 */

export interface TwoKeyPromiseCache<Context, T> {
  listeners: PromiseCacheListener<Context, T>[]
  cache: NameAnd<NameAnd<Promise<T>>>
}

export function getOrUpdateFromPromiseCache<Context, T> ( engine: TwoKeyPromiseCache<Context, T>, context: Context, name1: string, name2: string, raw: () => Promise<T> ): Promise<T | undefined> {
  const { listeners, cache } = engine
  const thisCache: NameAnd<Promise<T>> = cache[ name1 ] || {}
  const saved = thisCache[ name2 ]
  if ( saved ) {
    callListeners ( listeners, 'duplicateCall', l => l.duplicateCall ( context ) )
    return saved
  }
  callListeners ( listeners, 'callingLoad', l => l.callingLoad ( context ) )
  const result = raw ().then ( res => {
    callListeners ( listeners, 'loadArrived', l => l.loadArrived ( context, res ) )
    return res;
  } ).catch ( e => {
    callListeners ( listeners, 'loadError', l => l.loadError ( context, e ) )
    return undefined
  } ).finally ( () => {delete thisCache[ name2 ]} );
  thisCache[ name2 ] = result
  cache[ name1 ] = thisCache
  return result
}

