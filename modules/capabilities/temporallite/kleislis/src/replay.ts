import { IncMetric, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, K0, K1, K2, K3, K4, K5 } from "@itsmworkbench/kleislis";


export interface ReplayEngine<E> {
  incMetric?: IncMetric
  currentReplayIndex?: number
  eventProcessor: EventProcessor<E>
  replayState?: E[]
  updateEventHistory?: ( e: ReplayEvent ) => void
}
export type ParamsEvent = {
  id: string
  params: any[]
}

export function isParamsEvent ( item: ReplayEvent ): item is ParamsEvent {
  return (item as ParamsEvent).params !== undefined
}

export type SucessfulEvent = {
  id: string
  success: any
}
export function isSucessfulEvent<T> ( item: ReplayEvent ): item is SucessfulEvent {
  return (item as SucessfulEvent).success !== undefined
}
export type FailedEvent = {
  id: string
  failure: any
}
export function isFailedEvent ( item: ReplayEvent ): item is FailedEvent {
  return (item as FailedEvent).failure !== undefined
}
export type ReplayEvent = SucessfulEvent | FailedEvent | ParamsEvent
export type ReplayEvents = ReplayEvent[]


export type  EventProcessor<E> = <T>( activityId: string, e: E ) => T  // might also throw the previous exception

export function replyEventProcessor ( incMetric: IncMetric | undefined ): EventProcessor<ReplayEvent> {
  return ( activityId, e ) => {
    if ( e.id !== activityId ) {
      if ( incMetric ) incMetric ( 'activity.replay.invalidid' )
      throw new Error ( `Invalid replay item. It should have had id ${activityId} and had ${(e as any).id}: ${JSON.stringify ( e )}` );
    }
    if ( isSucessfulEvent ( e ) ) {
      if ( incMetric ) incMetric ( 'activity.replay.success' )
      return e.success;
    } else if ( isFailedEvent ( e ) ) {
      if ( incMetric ) incMetric ( 'activity.replay.success' )
      throw enhanceErrorWithOriginalProperties ( e.failure );
    } else if ( isParamsEvent ( e ) ) {
      if ( incMetric ) incMetric ( 'activity.replay.invalidParamsEvent' )
      throw new Error ( `Invalid params event. These should only occur at 'zero' and already have been processed: ${JSON.stringify ( e )}` );
    } else {
      if ( incMetric ) incMetric ( 'activity.replay.invalid' )
      throw new Error ( `Invalid replay item: ${JSON.stringify ( e )}` );
    }
  }
}

export function withReplay<E, T> ( activityId: string, fn: K0<T> ): InjectedK0<ReplayEngine<E>, T>
export function withReplay<E, P1, T> ( activityId: string, fn: K1<P1, T> ): InjectedK1<ReplayEngine<E>, P1, T>
export function withReplay<E, P1, P2, T> ( activityId: string, fn: K2<P1, P2, T> ): InjectedK2<ReplayEngine<E>, P1, P2, T>
export function withReplay<E, P1, P2, P3, T> ( activityId: string, fn: K3<P1, P2, P3, T> ): InjectedK3<ReplayEngine<E>, P1, P2, P3, T>
export function withReplay<E, P1, P2, P3, P4, T> ( activityId: string, fn: K4<P1, P2, P3, P4, T> ): InjectedK4<ReplayEngine<E>, P1, P2, P3, P4, T>
export function withReplay<E, P1, P2, P3, P4, P5, T> ( activityId: string, fn: K5<P1, P2, P3, P4, P5, T> ): InjectedK5<ReplayEngine<E>, P1, P2, P3, P4, P5, T>
export function withReplay<E, T, Args extends any[]> (
  activityId: string,
  fn: ( ...args: Args ) => Promise<T> ): ( e: ReplayEngine<E> ) => ( ...args: Args ) => Promise<T> {
  return engine => async ( ...args: Args ): Promise<T> => {
    let { currentReplayIndex, replayState, updateEventHistory, incMetric, eventProcessor } = engine
    if ( replayState === undefined ) replayState = []
    if ( currentReplayIndex === undefined ) currentReplayIndex = 0
    if ( eventProcessor === undefined ) throw new Error ( 'eventProcessor is required' )

    // Retrieve the current replay item if it exists
    const replayItem = replayState[ currentReplayIndex ];

    // Move to the next index
    engine.currentReplayIndex = currentReplayIndex + 1;
    // Check if we can use a cached result
    if ( replayItem ) return eventProcessor<T> ( activityId, replayItem );

// Execute the function and update the cache if no valid cache item was found
    try {
      const result = await fn ( ...args );
      updateEventHistory ( { id: activityId, success: result } );
      return result;
    } catch ( failure ) {
      updateEventHistory ( { id: activityId, failure } );
      throw failure;
    }
  }
}

function enhanceErrorWithOriginalProperties ( originalError: any ) {
  const newError = new Error ( originalError.message );
  newError.name = originalError.name;

  // Copy all enumerable properties from the original error to the new error
  Object.keys ( originalError ).forEach ( key => {
    newError[ key ] = originalError[ key ];
  } );

  return newError;
}
export const rememberUpdateCache = <T> ( store: ReplayEvents ) => async e => {store.push ( e );}
