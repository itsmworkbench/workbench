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
  info?: ( context: Context, title: string, msg: string ) => void
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

export type FCLogRecord<Context, T> = {
  context: Context
  title: string
  msg?: string
  t?: T
}
export function futureCacheConsoleLog<Context, T> ( title: string ): PromiseCacheListener<Context, T> {
  return {
    duplicateCall: ( context ) => console.log ( title, `duplicateCall`, context ),
    callingLoad: ( context ) => console.log ( title, `callingLoad`, context ),
    loadAborted: ( context ) => console.log ( title, `loadAborted`, context ),
    loadArrived: ( context, result ) => console.log ( title, `loadArrived`, context, result ),
    loadAbandoned: ( context, reason ) => console.log ( title, `loadAbandoned`, context, reason ),
    loadError: ( context, e ) => console.log ( title, `loadError`, context, e ),
    info: ( context, t, msg ) => console.log ( title, `${t}: ${JSON.stringify ( context )} ${msg}` )
  }

}
export function futureCacheLog<Context, T> ( array: FCLogRecord<Context, T>[] ): PromiseCacheListener<Context, T> {
  return {
    duplicateCall: ( context ) => array.push ( { context, title: 'duplicateCall' } ),
    callingLoad: ( context ) => array.push ( { context, title: 'callingLoad' } ),
    loadAborted: ( context ) => array.push ( { context, title: 'loadAborted' } ),
    loadArrived: ( context, t ) => array.push ( { context, title: 'loadArrived', t } ),
    loadAbandoned: ( context, reason ) => array.push ( { context, title: 'loadAbandoned', msg: reason } ),
    loadError: ( context, e ) => array.push ( { context, title: 'loadError', msg: e } ),
    info: ( context, title, msg ) => array.push ( { context, title, msg } )
  }

}
export function futureCacheLogString<Context, T> ( array: string[] ): PromiseCacheListener<Context, T> {
  return {
    duplicateCall: ( context ) => array.push ( `duplicateCall: ${JSON.stringify ( context )}` ),
    callingLoad: ( context ) => array.push ( `callingLoad: ${JSON.stringify ( context )}` ),
    loadAborted: ( context ) => array.push ( `loadAborted: ${JSON.stringify ( context )}` ),
    loadArrived: ( context, result ) => array.push ( `loadArrived: ${JSON.stringify ( context )} ${JSON.stringify ( result )}` ),
    loadAbandoned: ( context, reason ) => array.push ( `loadAbandoned: ${JSON.stringify ( context )} ${reason}` ),
    loadError: ( context, e ) => array.push ( `loadError: ${JSON.stringify ( context )} ${e}` ),
    info: ( context, title, msg ) => array.push ( `${title}: ${JSON.stringify ( context )} ${msg}` )
  }

}