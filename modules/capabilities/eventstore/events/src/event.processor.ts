import { AppendEvent, BaseEvent, ErrorEvent, Event, EventNameAnd, isErrorEvent, isLensPathEvent, SetIdEvent, SetValueEvent, ZeroEvent } from "./events";
import { pathToLens, PathToLensFn } from "@itsmworkbench/optics";
import { parseIdentityUrlOrThrow, UrlLoadIdentityFn } from "@itsmworkbench/urlstore";
import { hasErrors } from "@laoban/utils";
import { IncMetric } from "@itsmworkbench/kleislis";

/** Why a promise? Because the IdEvent goes to the id store to get the data. The id store is async. */
export type EventProcessorFn<S, E extends BaseEvent> = ( p: EventProcessor<S>, event: E, s: S ) => Promise<S>

export type EventProcessorListener<S> = ( event: Event, startS: S, newS: S ) => void
export interface EventProcessor<S> {
  zero: S
  pathPrefix: string
  processors: EventNameAnd<EventProcessorFn<S, any>> // too hard to properly express the type of the processors in Typescript
  listeners: EventProcessorListener<S>[]
  pathToLens: PathToLensFn<S>
  urlLoadFn: UrlLoadIdentityFn
}



export function defaultEventProcessor<S> ( pathPrefix: string, zero: S, urlLoadFn: UrlLoadIdentityFn ): EventProcessor<S> {
  return {
    pathPrefix,
    zero,
    processors: defaultProcessors<S> (),
    listeners: [],
    pathToLens: pathToLens<S> (),
    urlLoadFn
  }
}
export function addListener<S> ( processor: EventProcessor<S>, listener: EventProcessorListener<S> ): void {
  processor.listeners.push ( listener )
}

export function zeroEventProcessor<S> (): EventProcessorFn<S, ZeroEvent> {
  return async ( p ) => p.zero
}
export function setIdEventProcessor<S> (): EventProcessorFn<S, SetIdEvent> {
  return async ( p, e, s: S ) => {
    let value = await p.urlLoadFn ( parseIdentityUrlOrThrow ( e.id ) )
    if ( hasErrors ( value ) ) throw new Error ( `Error in setIdEventProcessor. ${JSON.stringify ( value )}. Event was ${JSON.stringify ( e )}\n${JSON.stringify ( s )}` )
    let lens = p.pathToLens ( e.path )
    return lens.set ( s, value.result )
  }
}

export function setValueEventProcessor<S> (): EventProcessorFn<S, SetValueEvent> {
  return async ( p, e, s: S ) => {
    let lens = p.pathToLens ( e.path )
    return lens.set ( s, e.value )
  }
}
export function appendEventProcessor<S> (): EventProcessorFn<S, AppendEvent> {
  return async ( p, e, s: S ) => {
    let lens = p.pathToLens ( e.path )
    let value = lens.getOption ( s )
    if ( !Array.isArray ( value ) && value !== undefined && value !== null ) throw new Error ( `Cannot append to non array at ${e.path}. Value at that location is ${JSON.stringify ( value )}` )
    return lens.set ( s, [ ...(value || []), e.value ] )
  }
}

export function doNothingOnErrorProcessor<S> (): EventProcessorFn<S, any> {
  return async ( p, e, s: S ) => s
}

export function infoEventProcessor<S> (): EventProcessorFn<S, any> {
  return async ( p, e, s: S ) => s
}
export function defaultProcessors<S> (): EventNameAnd<EventProcessorFn<S, any>> {
  return {
    zero: zeroEventProcessor<S> (),
    setId: setIdEventProcessor<S> (),
    setValue: setValueEventProcessor<S> (),
    append: appendEventProcessor<S> (),
    info: infoEventProcessor<S> (),
    error: doNothingOnErrorProcessor<S> ()
  }
}

export type EventProcessorResult<S> = {
  state?: S
  errors: ErrorEvent[]
}

export async function processEvent<S> ( processor: EventProcessor<S>, startState: S, e: Event ): Promise<EventProcessorResult<S>> {
  try {
    let processorFn: EventProcessorFn<S, any> = processor.processors[ e.event ]
    const eventWithPrefix = isLensPathEvent ( e ) ? { ...e, path: processor.pathPrefix + e.path } : e
    if ( !processorFn ) return { errors: [ { event: 'error', error: `No processor for event ${e.event}`, context: {} } ] }
    let state = await processorFn ( processor, eventWithPrefix, startState );
    for ( let listener of processor.listeners ) {
      try {listener ( e, startState, state )} catch ( e: any ) {
        return { errors: [ { event: 'error', error: `Error in listener ${e.message}`, context: { event: e } } ] }
      }
    }
    return { state, errors: [] }
  } catch ( e: any ) {
    return { errors: [ { event: 'error', error: `Error in processEvent ${e.message}`, context: { event: e } } ] }
  }
}

export async function processEvents<S> ( processor: EventProcessor<S>, baseState: S, events: Event[] ): Promise<EventProcessorResult<S>> {
  let state = baseState
  const errors: ErrorEvent[] = []
  for ( let e of events ) {
    if ( isErrorEvent ( e ) ) errors.push ( e ); else {
      const result = await processEvent ( processor, state, e )
      if ( result === undefined ) throw new Error ( `result is undefined. ${JSON.stringify ( e )}` )
      if ( result.errors && result.errors.length > 0 )
        errors.push ( ...result.errors )
      else {
        if ( result.state === undefined ) throw new Error ( `result.state is undefined. ${JSON.stringify ( e )}` )
        state = result.state
        }}
  }
  return { errors, state }
}

