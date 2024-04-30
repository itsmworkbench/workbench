import { NameAnd } from "@laoban/utils";
import { defaultRetryPolicy, inMemoryIncMetric, ReplayEvents } from "@itsmworkbench/kleislis";
import { nodeActivity, runWithActivityEngine } from "./node.activities";
import { ActivityEngine } from "@itsmworkbench/activities";


export const addOneA = nodeActivity ( { id: 'addone', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 1 )

describe ( "activity", () => {
  it ( "should have the config", () => {
    expect ( addOneA.config.id ).toBe ( 'addone' )
  } )
  it ( "should have the raw function", () => {
    expect ( addOneA.raw ( 1 ) ).resolves.toBe ( 2 )
  } )
  it ( 'should execute if there is a workflowHookState - first one doesnt create params', async () => {
    const store: ReplayEvents = []
    let metrics: NameAnd<number> = {};
    const incMetric = inMemoryIncMetric ( metrics )
    const activityEngine = { incMetric, updateEventHistory: e => store.push ( e ) }
    const result = await runWithActivityEngine ( activityEngine, () => addOneA ( 1 ) )
    expect ( result ).toBe ( 2 )
    expect ( store ).toEqual ( [
      { id: 'addone', success: 2 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.success": 1
    } )
  } )
  it ( 'should execute if there is a workflowHookState - second one doesnt create params', async () => {
    const store: ReplayEvents = [
      { "id": "addone", "params": [ 1 ] },
      { id: 'other', success: 2 } ]

    let metrics: NameAnd<number> = {};
    const incMetric = inMemoryIncMetric ( metrics )
    const activityEngine: ActivityEngine = { currentReplayIndex: 1, incMetric, updateEventHistory: e => store.push ( e ) }
    const result = await runWithActivityEngine ( activityEngine, () => addOneA ( 1 ) )
    expect ( result ).toBe ( 2 )
    expect ( store ).toEqual ( [
      { "id": "addone", "params": [ 1 ] },
      { "id": "other", "success": 2 },
      { "id": "addone", "success": 2 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.success": 1
    } )
  } )
  it ( "should keep retrying until it succeeds if there is a suitable retry policy", async () => {
    let addOneErrorCount = 0
    const addOneAErrorFourTimes = nodeActivity ( {
      id: 'addOneError',
      retry: { initialInterval: 10, maximumInterval: 20, maximumAttempts: 5 }
    }, async ( input: number ): Promise<number> => {
      if ( addOneErrorCount++ < 4 ) throw new Error ( 'addOneError: ' + addOneErrorCount )
      return input + 1;
    } )
    const store: ReplayEvents = []
    const metrics: NameAnd<number> = {}
    const incMetric = inMemoryIncMetric ( metrics )
    const activityEngine = { incMetric, updateEventHistory: e => store.push ( e ) }

    const result = await runWithActivityEngine ( activityEngine, () => addOneAErrorFourTimes ( 1 ) )
    expect ( result ).toBe ( 2 )
    expect ( store ).toEqual ( [
      { id: 'addOneError', success: 2 }
    ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 5,
      "activity.retry[1]": 1,
      "activity.retry[2]": 1,
      "activity.retry[3]": 1,
      "activity.retry[4]": 1,
      "activity.success": 1
    } )
  } )
} )