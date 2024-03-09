import { StateStoreQueueItem } from "./state.store.queue.items";
import { callErrors, callListeners, EventStoreListener, InternalStateStore } from "./state.store";

//Mostly used for testing

export type SimpleStateStoreExtras<S> = {
  queue: StateStoreQueueItem<S, any>[],
  listeners: EventStoreListener<S>[]
}

export function simpleStateStore<S> ( startState: S ): InternalStateStore<S> & SimpleStateStoreExtras<S> {
  let sequenceNumber = 0;
  const queue: StateStoreQueueItem<S, any>[] = [];
  let state = startState;
  let listeners: EventStoreListener<S>[] = []
  return {
    queue,
    listeners,
    state: () => state,
    setState: ( qi, s: S ) => {
      const oldState = state
      state = s
      callListeners ( listeners, oldState, s, qi )
    },
    errors: ( msg: string, qi: StateStoreQueueItem<S, any> ) => callErrors ( listeners, msg, qi ),
    incrementSequenceNumber: ( n: number ) => sequenceNumber += n,
    sequenceNumber: () => sequenceNumber,
    putOnQueue: ( q ) => queue.push ( q ),
    addListener: ( listener ) => listeners.push ( listener )
  }
}
export type MsgAndQueueItem<S> = { msg: string, queueItem: StateStoreQueueItem<S, any> }

export function rememberErrors<S> ( stateStore: InternalStateStore<S> ): () => MsgAndQueueItem<S>[] {
  const errors: MsgAndQueueItem<S>[] = []
  stateStore.addListener ( {
    listener: ( oldS, s, why ) => { },
    error: ( msg, why ) => errors.push ( { msg, queueItem: why } )
  } )
  return () => errors
}