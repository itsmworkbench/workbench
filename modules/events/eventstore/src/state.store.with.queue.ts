import { InternalStateStore, StateStore, StateStoreErrorFn } from "./state.store";
import { processQueueItem, StateStoreQueueItem } from "./state.store.queue.items";

export interface StateStoreWithQueue<S> extends InternalStateStore<S> {
  currentState: S
  currentSequenceNumber: number
  queue: StateStoreQueueItem<S, any> []
  pollInterval: number
  polling: boolean
}
export function isStateStoreWithQueue<S> ( x: StateStore<S> ): x is StateStoreWithQueue<S> {
  return 'queue' in x && 'pollInterval' in x && 'polling' in x
}

export function poll<S> ( s: StateStoreWithQueue<S> ) {
  if ( !s.polling ) return
  const queueItems = s.queue
  s.queue = []
  try {
    queueItems.forEach ( processQueueItem ( s ) )
  } finally {
    setTimeout ( () => poll ( s ), s.pollInterval )
  }
}
export function stateStoreWithQueue<S> ( startStart: S, errors: StateStoreErrorFn<S>, pollInterval: number = 100 ): StateStoreWithQueue<S> {
  const result: StateStoreWithQueue<S> = {
    currentState: startStart,
    state: () => result.currentState,
    setState: ( s: S ) => result.currentState = s,
    currentSequenceNumber: 0,
    sequenceNumber: () => result.currentSequenceNumber,
    incrementSequenceNumber: () => result.currentSequenceNumber++,
    errors,
    putOnQueue: ( qi ) => result.queue.push ( qi ),
    queue: [],
    pollInterval,
    polling: false
  }
  return result
}

export function startPolling<S> ( s: StateStore<S> ) {
  if ( !isStateStoreWithQueue ( s ) ) throw Error ( `Not a StateStoreWithQueue` )
  s.polling = true
  poll ( s )
}
export function stopPolling<S> ( s: StateStore<S> ) {
  if ( !isStateStoreWithQueue ( s ) ) throw Error ( `Not a StateStoreWithQueue` )
  s.polling = false
}