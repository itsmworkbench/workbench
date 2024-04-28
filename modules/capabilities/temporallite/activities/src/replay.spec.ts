import { runWithWorkflowHookState, runWithWorkflowLogsAndMetrics } from "./async.hooks";
import { withReplay } from "./replay";
import { NameAnd } from "@laoban/utils";
import { ActivityEvents } from "./activity.events";
import { inMemoryIncMetric } from "@itsmworkbench/kleislis"


describe ( 'replay', () => {
  const activityId = 'testActivity';
  let replayState;
  let updateState: ActivityEvents // Separate state for updates
  let metrics: NameAnd<number> = {}
  const incMetric = inMemoryIncMetric ( metrics );
  const empty = { workflowId: 'someId', workflowInstanceId: 'anotherId', currentReplayIndex: 0 }
  beforeEach ( () => {
    replayState = []; // Replay state is now an array of ReplayItems
    updateState = []
    for ( const key in metrics ) delete metrics[ key ]
  } );

  const updateCache = async ( e ) => {updateState.push ( e )}


  it ( 'should return a cached success result without executing the function', async () => {
    const fn = jest.fn ( () => Promise.resolve ( 'new data' ) );
    replayState.push ( { id: activityId, success: 'cached data' } ); // Add a successful replay item

    const replayFunction = withReplay<string> ( activityId, fn );
    const result = await runWithWorkflowLogsAndMetrics ( { ...empty, replayState, updateEventHistory: updateCache }, { incMetric }, {},
      async () => await replayFunction () );

    expect ( result ).toBe ( 'cached data' );
    expect ( fn ).not.toHaveBeenCalled ();
    expect ( updateState ).toEqual ( [] )
    expect ( metrics ).toEqual ( { 'activity.replay.success': 1 } )
  } );

  it ( 'should execute the function and update the update cache if no cached result is available', async () => {
    const fn = jest.fn ( () => Promise.resolve ( 'new data' ) );
    // No previous executions or cached results

    const replayFunction = withReplay ( activityId, fn );
    const result = await runWithWorkflowLogsAndMetrics ( { ...empty, replayState, updateEventHistory: updateCache }, { incMetric }, {},
      async () => await replayFunction () );

    expect ( result ).toBe ( 'new data' );
    expect ( fn ).toHaveBeenCalledTimes ( 1 );
    expect ( updateState ).toEqual ( [ { "id": "testActivity", "success": "new data" } ] )
    expect ( metrics ).toEqual ( {} )
  } );

  it ( 'should throw a recorded error if the previous execution resulted in an error', async () => {
    const fn = jest.fn ( () => Promise.resolve ( 'new data' ) );
    replayState.push ( { id: activityId, failure: new Error ( 'Error during execution' ) } ); // Add a failed replay item

    const replayFunction = await withReplay ( activityId, fn );

    const result = await runWithWorkflowLogsAndMetrics ( { ...empty, replayState, updateEventHistory: updateCache }, { incMetric }, {},
      async () => await replayFunction () );
    // Expect the function to throw the recorded error
    await expect ( result ).rejects.toThrow ( 'Error during execution' );
    expect ( fn ).not.toHaveBeenCalled ();
    expect ( updateState ).toEqual ( [] )
    expect ( metrics ).toEqual ( { 'activity.replay.success': 1 } )
  } );
} );
