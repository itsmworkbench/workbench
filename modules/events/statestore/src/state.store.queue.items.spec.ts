import { asyncQueueItem, AsyncStateStoreQueueItem, checkGuardsAndPutBackIfNeededForAsync, checkGuardsAndPutBackIfNeededForSync, isAsyncStateStoreQueueItem, processSyncQueueItem, syncQueueItem, SyncStateStoreQueueItem } from "./state.store.queue.items";
import { Lenses } from "@focuson/lens";
import { rememberErrors, simpleStateStore } from "./simple.state.store";

const mockState = { someValue: 10 };
type MockState = typeof mockState;
const mockOptional = Lenses.identity<MockState> ().focusOn ( 'someValue' );

describe ( 'Queue Item Creation', () => {
  const mockStateStore = simpleStateStore ( mockState );

  it ( 'creates a synchronous queue item correctly', () => {
    const syncFn = ( startValue: number ) => startValue + 1;
    const item = syncQueueItem ( mockStateStore, mockOptional, syncFn );

    expect ( item.async ).toBe ( false );
    expect ( item.sequenceNumber ).toBe ( 0 );
    expect ( item.syncFn ).toBe ( syncFn );
    expect ( typeof item.syncFn ).toBe ( 'function' );
  } );

  it ( 'creates an asynchronous queue item correctly', async () => {
    const asyncFn = ( startValue: number ) => Promise.resolve ( startValue + 1 );
    const item = await asyncQueueItem ( mockStateStore, mockOptional, asyncFn, { retry: true, count: 3 } );

    expect ( item.async ).toBe ( true );
    expect ( item.retry ).toBe ( true );
    expect ( item.count ).toBe ( 3 );
    expect ( item.sequenceNumber ).toBe ( 0 );
    expect ( item.startValue ).toBe ( 10 );
    expect ( item.asyncFn ).toBe ( asyncFn );
  } );
} );

const baseAsyncQueueItem: AsyncStateStoreQueueItem<MockState, number> = {
  async: true,
  description: "item",
  sequenceNumber: 0,
  retry: true,
  count: 3,
  optional: mockOptional,
  startValue: undefined,
  asyncFn: _ => {throw Error ( 'should not be called' );}
}
const baseSyncQueueItem: SyncStateStoreQueueItem<MockState, number> = {
  async: false,
  description: "item",
  sequenceNumber: 0,
  optional: mockOptional,
  syncFn: _ => {throw Error ( 'should not be called' );}
}
describe ( 'checkGuardsAndPutBackIfNeededForSync with simpleStateStore', () => {

  it ( 'does nothing and returns false if sequence number does not match', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: SyncStateStoreQueueItem<MockState, number> = { ...baseSyncQueueItem, sequenceNumber: 1 };
    const result = checkGuardsAndPutBackIfNeededForSync ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 0 ); // No items should be added to the queue, because if the sequence number changed that's bad
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );


  it ( 'returns true when all conditions are met', () => {
    const store = simpleStateStore ( { ...mockState, someValue: 10 } );
    const errors = rememberErrors ( store )
    const queueItem: SyncStateStoreQueueItem<MockState, number> = baseSyncQueueItem
    const result = checkGuardsAndPutBackIfNeededForSync ( store, queueItem );
    expect ( result ).toBe ( true );
    expect ( store.queue.length ).toBe ( 0 ); // No new items should be added to the queue
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );
} );
describe ( 'checkGuardsAndPutBackIfNeededForASync with simpleStateStore', () => {
  it ( 'logs error and returns false when count reaches zero', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: AsyncStateStoreQueueItem<MockState, number> = { ...baseAsyncQueueItem, count: 0 };
    const result = checkGuardsAndPutBackIfNeededForAsync ( store, queueItem );
    expect ( result ).toBe ( false );
    const actualErrors = errors ();
    expect ( actualErrors.length ).toBe ( 1 );
    expect ( actualErrors[ 0 ].msg ).toBe ( 'Countdown reached zero' );
    expect ( actualErrors[ 0 ].queueItem ).toBe ( queueItem );
  } );

  it ( 'does nothing and returns false if sequence number does not match', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: AsyncStateStoreQueueItem<MockState, number> = { ...baseAsyncQueueItem, sequenceNumber: 1 };
    const result = checkGuardsAndPutBackIfNeededForAsync ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 0 ); // No items should be added to the queue, because if the sequence number changed that's bad
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'puts item back on the queue with decremented count and updated startValue if startValue does not match and retry is true', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: AsyncStateStoreQueueItem<MockState, number> = { ...baseAsyncQueueItem, startValue: 100, retry: true };
    const result = checkGuardsAndPutBackIfNeededForAsync ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 1 );
    const qi = store.queue[ 0 ];
    if ( !isAsyncStateStoreQueueItem ( qi ) ) throw Error ( 'should be an async queue item' );
    expect ( qi.count ).toBe ( 2 ); // Count decremented
    expect ( qi.startValue ).toBe ( 10 ); // startValue updated
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'does nothingif startValue does not match and retry is false', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: AsyncStateStoreQueueItem<MockState, number> = { ...baseAsyncQueueItem, startValue: 100, retry: false };
    const result = checkGuardsAndPutBackIfNeededForAsync ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 0 ); // No new items should be added to the queue
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'returns true when all conditions are met', () => {
    const store = simpleStateStore ( { ...mockState, someValue: 10 } );
    const errors = rememberErrors ( store )
    const queueItem: AsyncStateStoreQueueItem<MockState, number> = baseAsyncQueueItem

    const result = checkGuardsAndPutBackIfNeededForAsync ( store, { ...queueItem, startValue: 10 } );
    expect ( result ).toBe ( true );
    expect ( store.queue.length ).toBe ( 0 ); // No new items should be added to the queue
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } );
} );

describe ( 'processSyncQueueItem', () => {
  const mockCheckGuardsAndPutBackIfNeeded = jest.fn ();

// Reset mocks before each test
  beforeEach ( () => {
    mockCheckGuardsAndPutBackIfNeeded.mockClear ();
  } );


  it ( 'processes a sync queue item when guards pass', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: SyncStateStoreQueueItem<MockState, number> = { ...baseSyncQueueItem, syncFn: x => x + 1 };
    mockCheckGuardsAndPutBackIfNeeded.mockReturnValue ( true );
    processSyncQueueItem ( store, mockCheckGuardsAndPutBackIfNeeded, queueItem );
    expect ( store.state ().someValue ).toBe ( 11 );
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } )

  it ( 'does not process a sync queue item when guards fail', () => {
    const store = simpleStateStore ( mockState );
    const errors = rememberErrors ( store )
    const queueItem: SyncStateStoreQueueItem<MockState, number> = { ...baseSyncQueueItem, syncFn: x => x + 1 };
    mockCheckGuardsAndPutBackIfNeeded.mockReturnValue ( false );
    processSyncQueueItem ( store, mockCheckGuardsAndPutBackIfNeeded, queueItem );
    expect ( store.state ().someValue ).toBe ( 10 );
    expect ( errors ().length ).toBe ( 0 ); // No errors should be logged
  } )
} )

