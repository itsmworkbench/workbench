import { asyncQueueItem, CheckGuardsAndPutbackFn, checkGuardsAndPutBackIfNeeded, processSyncQueueItem, StateStoreQueueItem, syncQueueItem } from "./state.store.queue.items";
import { simpleStateStore, StateStore } from "./state.store";
import { Lenses } from "@focuson/lens";

const mockState = { someValue: 10 };
type MockState = typeof mockState;
const mockOptional = Lenses.identity<MockState> ().focusOn ( 'someValue' );

describe ( 'Queue Item Creation', () => {
  const mockStateStore = simpleStateStore ( mockState );

  it ( 'creates a synchronous queue item correctly', () => {
    const syncFn = ( startValue: number ) => startValue + 1;
    const item = syncQueueItem ( mockStateStore, mockOptional, syncFn, { retry: true, count: 3 } );

    expect ( item.async ).toBe ( false );
    expect ( item.retry ).toBe ( true );
    expect ( item.count ).toBe ( 3 );
    expect ( item.sequenceNumber ).toBe ( 0 );
    expect ( item.startValue ).toBe ( 10 );
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

const blankQueueItem: StateStoreQueueItem<MockState, number> = {
  async: false,
  description: "item",
  sequenceNumber: 0,
  retry: true,
  count: 3,
  optional: mockOptional,
  startValue: undefined,
  syncFn: _ => {throw Error ( 'should not be called' );}
}
describe ( 'checkGuardsAndPutBackIfNeeded with simpleStateStore', () => {
  it ( 'logs error and returns false when count reaches zero', () => {
    const store = simpleStateStore ( mockState );
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, count: 0 };
    const result = checkGuardsAndPutBackIfNeeded ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.actualErrors.length ).toBe ( 1 );
    expect ( store.actualErrors[ 0 ].msg ).toBe ( 'Countdown reached zero' );
    expect ( store.actualErrors[ 0 ].queueItem ).toBe ( queueItem );
  } );

  it ( 'does nothing and returns false if sequence number does not match', () => {
    const store = simpleStateStore ( mockState );
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, sequenceNumber: 1 };
    const result = checkGuardsAndPutBackIfNeeded ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 0 ); // No items should be added to the queue, because if the sequence number changed that's bad
    expect ( store.actualErrors.length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'puts item back on the queue with decremented count and updated startValue if startValue does not match and retry is true', () => {
    const store = simpleStateStore ( mockState );
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, startValue: 100, retry: true };
    const result = checkGuardsAndPutBackIfNeeded ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 1 );
    expect ( store.queue[ 0 ].count ).toBe ( 2 ); // Count decremented
    expect ( store.queue[ 0 ].startValue ).toBe ( 10 ); // startValue updated
    expect ( store.actualErrors.length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'does nothingif startValue does not match and retry is false', () => {
    const store = simpleStateStore ( mockState );
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, startValue: 100, retry: false };
    const result = checkGuardsAndPutBackIfNeeded ( store, queueItem );
    expect ( result ).toBe ( false );
    expect ( store.queue.length ).toBe ( 0 ); // No new items should be added to the queue
    expect ( store.actualErrors.length ).toBe ( 0 ); // No errors should be logged
  } );

  it ( 'returns true when all conditions are met', () => {
    const store = simpleStateStore ( {...mockState, someValue: 10});
    const queueItem: StateStoreQueueItem<MockState, number> = blankQueueItem

    const result = checkGuardsAndPutBackIfNeeded ( store, {...queueItem, startValue: 10} );
    expect ( result ).toBe ( true );
    expect ( store.queue.length ).toBe ( 0 ); // No new items should be added to the queue
    expect ( store.actualErrors.length ).toBe ( 0 ); // No errors should be logged
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
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, startValue: 10, syncFn: x => x + 1 };
    mockCheckGuardsAndPutBackIfNeeded.mockReturnValue ( true );
    processSyncQueueItem ( store, mockCheckGuardsAndPutBackIfNeeded, queueItem );
    expect ( store.state ().someValue ).toBe ( 11 );
    expect ( store.actualErrors.length ).toBe ( 0 );
  } )

  it ( 'does not process a sync queue item when guards fail', () => {
    const store = simpleStateStore ( mockState );
    const queueItem: StateStoreQueueItem<MockState, number> = { ...blankQueueItem, startValue: 10, syncFn: x => x + 1 };
    mockCheckGuardsAndPutBackIfNeeded.mockReturnValue ( false );
    processSyncQueueItem ( store, mockCheckGuardsAndPutBackIfNeeded, queueItem );
    expect ( store.state ().someValue ).toBe ( 10 );
    expect ( store.actualErrors.length ).toBe ( 0 );
  } )
} )

