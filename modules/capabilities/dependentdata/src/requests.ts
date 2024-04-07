import { NameAnd } from "@laoban/utils";
import { DiAction, load } from "./dependent.data";
import { DiHash, DiHashCache, diHashChanged, hashToString } from "./hash";

//Why this shape?
//Because things change across time. So I want to mutate the current state
//I will check because I do the mutation that the upstream hashes are the same
//These means that if there is a 'load' on a part of the state... it becomes managed state

export type DiRequest<S> = ( s: S ) => S | undefined

//This type is 'name of the di' -> 'hash of the di' -> the loading promise. When the loading ends,
//   then we need to check the state... and if changed we will return undefined
//   not yet sure what to do about errors... Looks complicated (and it's complicated in reality... often this is messed up in the systems we are replacing)
export type DiRequestCache<S> = NameAnd<NameAnd<Promise<DiRequest<S>>>>

export interface RequestEngineListener<S> {
  duplicateCall?: ( a: DiAction<S> ) => void
  callingLoad?: ( a: DiAction<S> ) => void
  loadAborted?: ( a: DiAction<S> ) => void
  loadArrived?: ( a: DiAction<S>, withS: S ) => void
  loadError?: ( a: DiAction<S>, e: any ) => void
}

export interface RequestEngine<S> {
  debug?: boolean
  cache: DiRequestCache<S>,
  listeners: RequestEngineListener<S>[]
}
function calListeners<L extends object> ( listeners: L[], call: keyof L, fn: ( l: L ) => void ) {
  for ( let l of listeners )
    if ( call in l ) {
      try {
        fn ( l )
      } catch ( e ) {
        console.error ( e )
      }
    }
}
const processArrive = <S> ( a: DiAction<S>, originalhash: DiHash, listeners: RequestEngineListener<S>[] ) => ( fn: ( s: S ) => S ): DiRequest<S> =>
  s => {
    const hash = a.di.hashFn ( a.di.optional.getOption ( s ) );
    if ( diHashChanged ( originalhash, hash ) ) {
      calListeners ( listeners, 'loadAborted', l => l.loadAborted ( a ) );
      return undefined;
    } else {
      let result = fn ( s );
      calListeners ( listeners, 'loadAborted', l => l.loadArrived ( a, result ) );
      return result;
    }
  };

const processError = <S> ( a: DiAction<S>, listeners: RequestEngineListener<S>[] ) => ( e: any ) => {
  calListeners ( listeners, 'loadError', l => l.loadError ( a, e ) );
  return undefined
}
export async function request<S> ( engine: RequestEngine<S>, hashCache: DiHashCache, a: DiAction<S> ): Promise<DiRequest<S>> {
  const { cache, listeners } = engine
  const name = a.di.name
  const hashAndValue = hashCache[ name ]
  if ( hashAndValue === undefined ) throw new Error ( 'No hash for ' + name ) // this is a software error: shouldn't happen.
  const cacheElement = cache[ name ] || {};

  const hashAsString = hashToString ( hashAndValue.value );
  const reqs = cacheElement?.[ hashAsString ]
  let result = undefined
  if ( reqs === undefined ) {
    const removeFromCache = () => cacheElement[ hashAsString ] = undefined;
    result = load ( a.di.dependsOn, a.params ).then ( processArrive ( a, hashAndValue.hash, listeners ) ).catch ( processError ( a, listeners ) ).finally ( removeFromCache )
    cacheElement[ hashAsString ] = result
    cache[ name ] = cacheElement
  } else {
    calListeners ( listeners, 'duplicateCall', l => l.duplicateCall ( a ) )
  }
  return result
}