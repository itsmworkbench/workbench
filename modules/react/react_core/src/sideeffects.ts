import { ErrorsAnd, flatMap, mapK, toArray } from "@laoban/utils";
import { Event } from "@itsmworkbench/events";
import { Lens, Optional, Transform } from "@focuson/lens";
import { massTransform } from "@focuson/lens";
import { NamedUrl, parseNamedUrlOrThrow, UrlSaveFn } from "@itsmworkbench/urlstore";

export type SideEffectType = string
export interface SideEffect {
  command: SideEffectType
}


export interface EventSideEffect extends SideEffect {
  command: 'event'
  event: Event
}
export function isEventSideEffect ( x: SideEffect ): x is EventSideEffect {
  return x.command === 'event'
}


export interface HasSideeffects {
  sideeffects: SideEffect[]

}
export interface SideeffectAndResult<R> {
  sideeffect: SideEffect
  result: ErrorsAnd<R>
}
export interface SideeffectResult<R> {
  sideeffect: SideEffect
  result: ErrorsAnd<R>
}

export type ResultsAndTransforms<S, R> = {
  result: ErrorsAnd<R>
  txs?: Transform<S, any> []

}
export type SideEffectResultsAndTransforms<S, R> = {
  sideeffect: SideEffect
  resultsAndTransforms: ResultsAndTransforms<S, R>
}
export interface ISideEffectProcessor<S, SE extends SideEffect, R> {
  accept: ( se: SideEffect ) => se is SE
  process: ( state: S, se: SE ) => Promise<ResultsAndTransforms<S, R>>
}

export function eventSideeffectProcessor<S> ( saveFn: UrlSaveFn, organisation: string,  ticketEventUrlL: Optional<S, string> ): ISideEffectProcessor<S, EventSideEffect, boolean> {
  return {
    accept: isEventSideEffect,
    process: async ( state, se ) => {
      const ticketId = ticketEventUrlL.getOption ( state )
      if ( !ticketId ) throw new Error ( 'No ticketId' )
      const url: NamedUrl = parseNamedUrlOrThrow( ticketId)
      console.log ( 'sending event', url, se.event )
      const result = await saveFn ( url, [ se.event ], { append: true, commit: false } )
      console.log ( 'eventSideeffectProcessor result', result )
      return { result: true }
    }
  }
}

export function processSideEffect<S> ( processors: ISideEffectProcessor<S, any, any>[] ): ISideEffectProcessor<S, SideEffect, any> {
  return {
    accept: ( se: SideEffect ): se is any => processors.find ( sp => sp.accept ( se ) ) !== undefined,
    process: async ( state, sideeffect: SideEffect ): Promise<ErrorsAnd<any>> => {
      for ( const p of processors )
        if ( p.accept ( sideeffect ) )
          return await p.process ( state, sideeffect )
      return [ `No processor for sideeffect ${sideeffect.command}` ]
    }
  };
}


export function processSideEffectsInState<S> ( sep: ISideEffectProcessor<S, SideEffect, any>, seLens: Lens<S, SideEffect[]>, logL: Lens<S, SideeffectAndResult<any>[]>, debug?: boolean ) {
  return async ( oldState: S, state: S, ) => {
    const sideeffects = seLens.getOption ( state ) || []
    if ( sideeffects.length === 0 ) {
      if ( debug ) console.log ( 'processSideEffectsInState', 'no sideeffects' )
      return state
    }
    if ( debug ) console.log ( 'processSideEffectsInState', 'sideeffects', sideeffects )
    const resultsAndTxs: SideEffectResultsAndTransforms<S, any>[] = await mapK ( sideeffects, async ( sideeffect ) => {
      let resultsAndTransforms: ResultsAndTransforms<S, any> = await sep.process ( state, sideeffect )
      if ( debug ) console.log ( 'processSideEffectsInState', 'sideeffect resultsAndTransforms', resultsAndTransforms )
      console.log ( 'processSideEffectsInState', 'sideeffect resultsAndTransforms', resultsAndTransforms )
      return { sideeffect, resultsAndTransforms }
    } )
    console.log ( 'resultsAndTxs', resultsAndTxs )
    const results: SideeffectAndResult<any>[] = resultsAndTxs.map ( r =>
      ({ sideeffect: r.sideeffect, result: r.resultsAndTransforms.result }) )
    console.log ( 'just results1', results )
    const txs: Transform<S, any>[] = flatMap ( resultsAndTxs, r => toArray ( r.resultsAndTransforms.txs ) );
    console.log ( 'txs', txs )
    const existingLog: SideeffectAndResult<any>[] = logL.getOption ( state ) || []
    const newLog = [ ...existingLog, ...results ]
    if ( debug ) console.log ( 'processSideEffectsInState', 'newLog', newLog )
    let withLog = seLens.set ( logL.set ( state, newLog ), [] );
    if ( debug )  console.log ( 'processSideEffectsInState', 'txs', txs )
    const final = massTransform ( withLog, ...txs )
    if ( debug ) console.log ( 'processSideEffectsInState', 'final', final )
    return final
  };
}
