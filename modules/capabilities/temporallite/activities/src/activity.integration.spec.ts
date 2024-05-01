import { activity, ActivityEngine } from "./activities";
import { NameAnd } from "@laoban/utils";
import { defaultRetryPolicy, inMemoryIncMetric, BasicReplayEvents } from "@itsmworkbench/kleislis";


export const addOneA = activity ( { id: 'addone', retry: defaultRetryPolicy }, async ( input: number ): Promise<number> => input + 1 )

describe ( "activity", () => {
  it ( "should have the config", () => {
    expect ( addOneA.config.id ).toBe ( 'addone' )
  } )
  it ( "should have the raw function", () => {
    expect ( addOneA.raw ( 1 ) ).resolves.toBe ( 2 )
  } )

  it ( 'should execute when passed an engine as the first activity', async () => {
    const remembered: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const incMetric = inMemoryIncMetric ( metrics );
    const engine: ActivityEngine = { incMetric: incMetric, updateEventHistory: async e => {remembered.push ( e )} }
    const result = await addOneA ( engine ) ( 1 )

    expect ( result ).toBe ( 2 )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.success": 1
    } )
    expect ( remembered ).toEqual ( [
      { "id": "addone", "success": 2 } ] )
  } )
  it ( 'should execute when passed an engine as a later action', async () => {
    const remembered: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const incMetric = inMemoryIncMetric ( metrics );
    const engine: ActivityEngine = { incMetric, updateEventHistory: async e => {remembered.push ( e )}, currentReplayIndex: 1 }
    const result = await addOneA ( engine ) ( 1 )

    expect ( result ).toBe ( 2 )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.success": 1
    } )
    expect ( remembered ).toEqual ( [ { id: 'addone', success: 2 } ] )
  } )
  it ( "should keep retrying until it succeeds if there is a suitable retry policy", async () => {
    let addOneErrorCount = 0
    const addOneAErrorFourTimes = activity ( {
      id: 'addOneError',
      retry: { initialInterval: 10, maximumInterval: 20, maximumAttempts: 5 }
    }, async ( input: number ): Promise<number> => {
      if ( addOneErrorCount++ < 4 ) throw new Error ( 'addOneError: ' + addOneErrorCount )
      return input + 1;
    } )
    const replayState: BasicReplayEvents = []
    const metrics: NameAnd<number> = {}
    const incMetric = inMemoryIncMetric ( metrics )
    const engine: ActivityEngine = { incMetric, updateEventHistory: async e => {replayState.push ( e )} }

    const result = await addOneAErrorFourTimes ( engine ) ( 1 )

    expect ( result ).toBe ( 2 )
    expect ( replayState ).toEqual ( [
      { "id": "addOneError", "success": 2 } ] )
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