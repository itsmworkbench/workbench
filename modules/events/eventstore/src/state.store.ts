import { StateStoreQueueItem } from "./state.store.queue.items";

export interface StateStore<S> {
  state (): S
  incrementSequenceNumber ( n: number )
  sequenceNumber (): number
  putOnQueue<Child> ( q: StateStoreQueueItem<S, Child> ): void
}

export type StateStoreErrorFn<S> = ( msg: string, qi: StateStoreQueueItem<S, any> ) => void
export interface InternalStateStore<S> extends StateStore<S> {
  setState ( s: S ): void
  errors: StateStoreErrorFn<S>
}
export type MsgAndQueueItem<S> = { msg: string, queueItem: StateStoreQueueItem<S, any> }
export function simpleStateStore<S> ( startState: S ): InternalStateStore<S> & { queue: StateStoreQueueItem<S, any>[], actualErrors: MsgAndQueueItem<S>[] } {
  let sequenceNumber = 0;
  const queue: StateStoreQueueItem<S, any>[] = [];
  const actualErrors: MsgAndQueueItem<S>[] = []
  let state = startState;
  return {
    queue,
    actualErrors,
    state: () => state,
    setState: ( s: S ) => state = s,
    errors: ( msg: string, qi: StateStoreQueueItem<S, any> ) => actualErrors.push ( { msg, queueItem: qi } ),
    incrementSequenceNumber: ( n: number ) => sequenceNumber += n,
    sequenceNumber: () => sequenceNumber,
    putOnQueue: ( q ) => queue.push ( q )
  }
}
export function isInternalStateStore<S> ( x: StateStore<S> ): x is InternalStateStore<S> {
  return 'setState' in x
}

