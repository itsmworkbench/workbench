import { callErrors, callListeners, EventStoreListener, InternalStateStore, StateStore, StateStoreErrorFn } from "./state.store";
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
export function stateStoreWithQueue<S> ( startStart: S, pollInterval: number = 100 ): StateStoreWithQueue<S> {
  let listeners: EventStoreListener<S>[] = []
  const result: StateStoreWithQueue<S> = {
    currentState: startStart,
    state: () => result.currentState,
    setState: ( qi, state: S ) => {
      const oldState = result.currentState
      result.currentState = state
      callListeners ( listeners, oldState, state, qi )
    },
    addListener: ( listener ) => listeners.push ( listener ),
    currentSequenceNumber: 0,
    sequenceNumber: () => result.currentSequenceNumber,
    incrementSequenceNumber: () => result.currentSequenceNumber++,
    errors: ( msg, qi ) => callErrors ( listeners, msg, qi ),
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