import { Optional } from "@focuson/lens";
import { InternalStateStore, isInternalStateStore, StateStore } from "./state.store";

export interface QueueItemOptions {
  description?: string
  retry: boolean
  count: number
}

export interface BaseStateStoreQueueItem<Main, Child> {
  async: boolean
  description: string
  sequenceNumber: number // OK when we change significantly what we are doing, we change this. For example start processing events from another file
  optional: Optional<Main, Child>
}
export interface SyncStateStoreQueueItem<Main, Child> extends BaseStateStoreQueueItem<Main, Child> {
  async: false
  syncFn: ( startValue: Child ) => Child
}
export function isSyncStateStoreQueueItem<Main, Child> ( x: StateStoreQueueItem<Main, Child> ): x is SyncStateStoreQueueItem<Main, Child> {
  return !x.async
}
export interface AsyncStateStoreQueueItem<Main, Child> extends BaseStateStoreQueueItem<Main, Child> {
  async: true
  retry: boolean
  count: number // A countdown, when get to zero abort with error... only matters if we retry
  startValue: Child | undefined
  asyncFn: ( startValue: Child ) => Promise<Child>
}
export function isAsyncStateStoreQueueItem<Main, Child> ( x: StateStoreQueueItem<Main, Child> ): x is AsyncStateStoreQueueItem<Main, Child> {
  return x.async
}
export type StateStoreQueueItem<Main, Child> = SyncStateStoreQueueItem<Main, Child> | AsyncStateStoreQueueItem<Main, Child>


export function syncQueueItem<Main, Child> ( stateStore: StateStore<Main>, optional: Optional<Main, Child>, syncFn: ( startValue: Child ) => Child, description?: string ): SyncStateStoreQueueItem<Main, Child> {
  return {
    sequenceNumber: stateStore.sequenceNumber (), optional,
    syncFn,
    description,
    async: false
  }
}
export function asyncQueueItem<Main, Child> ( stateStore: StateStore<Main>, optional: Optional<Main, Child>, asyncFn: ( startValue: Child ) => Promise<Child>, options?: QueueItemOptions ): AsyncStateStoreQueueItem<Main, Child> {
  const retry = options?.retry === undefined ? true : options.retry
  return {
    sequenceNumber: stateStore.sequenceNumber (),
    optional,
    startValue: optional.getOption ( stateStore.state () ),
    asyncFn,
    description: options?.description,
    async: true,
    retry, count: options?.count ?? 3
  }
}

export function checkGuardsAndPutBackIfNeededForSync<Main, Child> ( store: InternalStateStore<Main>, queueItem: StateStoreQueueItem<Main, Child> ): boolean {
  const { sequenceNumber } = queueItem
  let storeSequenceNumber = store.sequenceNumber ();
  if ( sequenceNumber !== storeSequenceNumber ) return false // not an error just ignore
  return true
}
export function checkGuardsAndPutBackIfNeededForAsync<Main, Child> ( store: InternalStateStore<Main>, queueItem: AsyncStateStoreQueueItem<Main, Child> ): boolean {
  const { count, sequenceNumber, optional, startValue, retry } = queueItem
  if ( count <= 0 ) {
    store.errors ( `Countdown reached zero`, queueItem );
    return false
  }

  let storeSequenceNumber = store.sequenceNumber ();
  if ( sequenceNumber !== storeSequenceNumber ) return false // not an error just ignore
  const currentChild: Child = optional.getOption ( store.state () )
  if ( currentChild !== startValue ) {
    if ( retry ) store.putOnQueue ( { ...queueItem, count: count - 1, startValue: currentChild } )
    return false
  }
  return true
}
export type CheckGuardsAndPutbackFn<QI extends BaseStateStoreQueueItem<Main, Child>, Main, Child> = ( store: InternalStateStore<Main>, queueItem: QI ) => boolean

export async function processAsyncQueueItem<Main, Child> ( store: StateStore<Main>, checkGuardsAndPutBackIfNeeded: CheckGuardsAndPutbackFn<AsyncStateStoreQueueItem<Main, Child>, Main, Child>, queueItem: AsyncStateStoreQueueItem<Main, Child> ) {
  if ( !isInternalStateStore ( store ) ) throw Error ( `store is not an InternalStateStore` )
  if ( !checkGuardsAndPutBackIfNeeded ( store, queueItem ) ) return
  const newValue = await queueItem.asyncFn ( queueItem.startValue )
  if ( checkGuardsAndPutBackIfNeeded ( store, queueItem ) ) {
    store.setState ( queueItem, queueItem.optional.set ( store.state (), newValue ) )
  }
}
export function processSyncQueueItem<Main, Child> ( store: InternalStateStore<Main>, checkGuardsAndPutBackIfNeeded: CheckGuardsAndPutbackFn<SyncStateStoreQueueItem<Main, Child>, Main, Child>, queueItem: SyncStateStoreQueueItem<Main, Child> ) {
  if ( !checkGuardsAndPutBackIfNeeded ( store, queueItem ) ) return
  const { optional, syncFn } = queueItem
  const oldValue = optional.getOption ( store.state () )
  const newValue = syncFn ( oldValue )
  store.setState ( queueItem, optional.set ( store.state (), newValue ) )
}

export const processQueueItem = <Main> ( store: InternalStateStore<Main> ) => async <Child> ( queueItem: StateStoreQueueItem<Main, Child> ) => {
  try {
    if ( isAsyncStateStoreQueueItem ( queueItem ) ) return await processAsyncQueueItem ( store, checkGuardsAndPutBackIfNeededForAsync, queueItem )
    if ( isSyncStateStoreQueueItem ( queueItem ) ) return processSyncQueueItem ( store, checkGuardsAndPutBackIfNeededForSync, queueItem )
    throw Error ( `Unknown queue item type ${JSON.stringify ( queueItem )}` )
  } catch ( e ) {
    store.errors ( e.toString (), queueItem )
  }
};