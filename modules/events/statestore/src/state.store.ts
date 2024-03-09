import { StateStoreQueueItem } from "./state.store.queue.items";

export type EventStoreListener<S> = {
  listener: ( oldS: S, s: S, why: StateStoreQueueItem<S, any> ) => void
  error: ( msg: string, why: StateStoreQueueItem<S, any> ) => void
}
export interface StateStore<S> {
  state (): S
  incrementSequenceNumber ( n: number )
  sequenceNumber (): number
  putOnQueue<Child> ( q: StateStoreQueueItem<S, Child> ): void
  addListener ( listener: EventStoreListener<S> ): void
}

export type StateStoreErrorFn<S> = ( msg: string, qi: StateStoreQueueItem<S, any> ) => void

export interface InternalStateStore<S> extends StateStore<S> {
  setState ( qi: StateStoreQueueItem<S, any>, s: S ): void
  errors: StateStoreErrorFn<S>
}

export function callListeners<S> ( listeners: EventStoreListener<S>[], oldS: S, s: S, why: StateStoreQueueItem<S, any> ) {
  for ( const listener of listeners ) {
    try {
      listener.listener ( oldS, s, why )
    } catch ( e ) {
      console.error ( 'Error in listener', e )
    }
  }
}

export function callErrors<S> ( listeners: EventStoreListener<S>[], msg: string, why: StateStoreQueueItem<S, any> ) {
for ( const listener of listeners ) {
    try {
      listener.error ( msg, why )
    } catch ( e ) {
      console.error ( 'Error in listener', e )
    }
  }
}
export function isInternalStateStore<S> ( x: StateStore<S> ): x is InternalStateStore<S> {
  return 'setState' in x
}

