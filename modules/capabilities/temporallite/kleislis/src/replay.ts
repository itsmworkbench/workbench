import { IncMetric, Injected, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, K0, K1, K2, K3, K4, K5 } from "@itsmworkbench/kleislis";


export interface ReplayEngine {
  incMetric?: IncMetric
  currentReplayIndex?: number
  replayState?: ReplayEvents
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


export function withReplay<T> ( activityId: string, fn: K0<T> ): InjectedK0<ReplayEngine, T>
export function withReplay<P1, T> ( activityId: string, fn: K1<P1, T> ): InjectedK1<ReplayEngine, P1, T>
export function withReplay<P1, P2, T> ( activityId: string, fn: K2<P1, P2, T> ): InjectedK2<ReplayEngine, P1, P2, T>
export function withReplay<P1, P2, P3, T> ( activityId: string, fn: K3<P1, P2, P3, T> ): InjectedK3<ReplayEngine, P1, P2, P3, T>
export function withReplay<P1, P2, P3, P4, T> ( activityId: string, fn: K4<P1, P2, P3, P4, T> ): InjectedK4<ReplayEngine, P1, P2, P3, P4, T>
export function withReplay<P1, P2, P3, P4, P5, T> ( activityId: string, fn: K5<P1, P2, P3, P4, P5, T> ): InjectedK5<ReplayEngine, P1, P2, P3, P4, P5, T>

export function withReplay<T, Args extends any[]> (
  activityId: string,
  fn: ( ...args: Args ) => Promise<T> ): ( e: ReplayEngine ) => ( ...args: Args ) => Promise<T> {
  return engine => async ( ...args: Args ): Promise<T> => {
    let { currentReplayIndex, replayState, updateEventHistory, incMetric } = engine
    if ( replayState === undefined ) replayState = []
    if ( currentReplayIndex === undefined ) currentReplayIndex = 0


    // Retrieve the current replay item if it exists
    const replayItem = replayState[ currentReplayIndex ];

    // Move to the next index
    engine.currentReplayIndex = currentReplayIndex + 1;
    // Check if we can use a cached result
    if ( replayItem ) {
      if ( replayItem.id === activityId ) {
        if ( isSucessfulEvent<T> ( replayItem ) ) {
          incMetric ( 'activity.replay.success' )
          return replayItem.success;
        }  // Return the successful result from cache
        if ( isFailedEvent ( replayItem ) ) {
          incMetric ( 'activity.replay.success' )
          throw enhanceErrorWithOriginalProperties ( replayItem.failure );
        } else if ( isParamsEvent ( replayItem ) ) {
          incMetric ( 'activity.replay.invalidParamsEvent' )
          throw new Error ( `Invalid params event at currentreplayIndex ${currentReplayIndex}. These should only occur at 'zero' and already have been processed: ${JSON.stringify ( replayItem )}` );
        } else {
          incMetric ( 'activity.replay.invalid' )
          throw new Error ( `Invalid replay item: ${JSON.stringify ( replayItem )}` );
        }  // Rethrow the cached failure
      } else {
        incMetric ( 'activity.replay.invalidid' )
        throw new Error ( `Invalid replay item. It should have had id ${activityId} and had ${(replayItem as any).id}: ${JSON.stringify ( replayItem )}` );
      }

    }
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
