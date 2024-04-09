import { DiAction, FetchDiAction, isFetchDiAction, } from "./di.actions";

import { callListeners, getOrUpdateFromPromiseCache, PromiseCacheListener, TwoKeyPromiseCache } from "@itsmworkbench/utils";
import { diTagChanged } from "./tag";
import { TagStoreGetter } from "./tag.store";
import { dependents } from "./dependent.data";
import { collect, flatMap } from "@laoban/utils";

//Why this shape?
//Because things change across time. So I want to mutate the current state
//I thus need to check before I  do the mutation that the upstream hashes are the same
//These means that if there is a 'load' on a part of the state... it becomes managed state
//Note that the DoActionRes when we have 'updates' takes a new S. This is 'the current S'

export type DoActionsFn<S> = ( dis: DiAction<S, any>[] ) => DoActionRes<S>

export type DoActionRes<S> = {
  newS: ( s: S ) => S // has all the nuked or defaulted values. The ones we know 'now'
  updates: Promise<DiRequest<S>>[] // all the things that will be done in the future
}

export type DiRequest<S> = ( s: S ) => StateAndWhy<S>

export type RequestEngine<S> = TwoKeyPromiseCache<DiAction<S, any>, DiRequest<S>>


export function executeClean<S> ( s: S, a: DiAction<S, any> ): S {
  const clean = a.clean
  return clean === undefined ? s : a.di.optional.set ( s, clean.value )
}
export function executeAllCleans<S> ( s: S, actions: DiAction<S, any>[] ): S {
  return actions.reduce ( executeClean, s )
}

export type StateAndWhy<S> = {
  s: S
  name: string
  t: any
  changed: boolean
  why: string
}

export const uncachedSendRequestForFetchAction = <S, T> ( listeners: PromiseCacheListener<DiAction<S, T>, T>[], tagGetter: TagStoreGetter<S> ) =>
  ( a: FetchDiAction<S, T> ) => async (): Promise<DiRequest<S>> => {
    const t = await a.load ()
    return ( s: S ) => {
      const deps = dependents ( a.di.dependsOn );
      const changed = flatMap ( deps, ( d, i ) => diTagChanged ( a.tags[ i ].tag, tagGetter ( s, d.name ) ) ? [ d.name ] : [] )
      if ( changed.length > 0 ) {//don't do anything if upstreams have changed as our data is probably wrong, and we want a new load to get it...
        callListeners ( listeners, 'loadAbandoned', l => l.loadAbandoned ( a, changed.join ( ',' ) ) )
        return { s, why: `Changed ${changed.join ( ',' )}`, changed: false, t, name: a.di.name }
      }
      const rawNewS = a.di.optional.set ( s, t )
      const newS = rawNewS === undefined ? s : rawNewS
      return { s: newS, why: `Loaded ${a.di.name}`, changed: true, t, name: a.di.name }
    }
  }

export const sendRequestForFetchAction = <S, T> ( engine: RequestEngine<S>, tagGetter: TagStoreGetter<S> ) => {
  const uncachedRequest = uncachedSendRequestForFetchAction ( engine.listeners, tagGetter )
  return async ( a: FetchDiAction<S, T> ): Promise<DiRequest<S>> => {
    const name = a.di.name
    const tags = JSON.stringify ( a.tags );//so won't resend unless up stream changes
    return getOrUpdateFromPromiseCache ( engine, a, name, tags, uncachedRequest ( a ) )
  };
}

export function doActions<S> ( engine: RequestEngine<S>, tagGetter: TagStoreGetter<S> ): DoActionsFn<S> {
  const sendRequest = sendRequestForFetchAction ( engine, tagGetter )
  return ( dis: DiAction<S, any>[] ): DoActionRes<S> => {
    const fetchActions = collect ( dis, isFetchDiAction, a => a as FetchDiAction<S, any> )
    const newS = ( s: S ) => executeAllCleans ( s, dis )
    const updates = fetchActions.map ( sendRequest )
    return { newS, updates }
  }
}

