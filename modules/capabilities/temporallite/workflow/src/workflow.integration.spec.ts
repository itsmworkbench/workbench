import { workflow, WorkflowEngine } from "./workflow";
import { NameAnd } from "@laoban/utils";
import { activity, ActivityEngine } from "@itsmworkbench/activities";
import { defaultRetryPolicy, inMemoryIncMetric, rememberUpdateCache, BasicReplayEvents } from "@itsmworkbench/kleislis";

const workflowInstanceId = "1";

export function makeWorkflowEngine ( existing: BasicReplayEvents, store: BasicReplayEvents, metrics: NameAnd<number> ): WorkflowEngine {
  return {
    incMetric: () => inMemoryIncMetric ( metrics ),
    existingState: async ( id ) => existing,
    updateEventHistory: () => rememberUpdateCache ( store ),
    nextInstanceId: async ( ) => workflowInstanceId
  }
}
export const activityAddOne = activity ( { id: 'addone', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 1 )
export const activityAddFour = activity ( { id: 'addfour', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 4 )
export const activityAddEight = activity ( { id: 'addeight', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 8 )
export const wfAdd13 = workflow ( { id: 'wfAdd13' },
  async ( engine: ActivityEngine, i: number ) => { //wow this sucks. All this rubbish with (engine). Need to move to zoom/nodeactivities and hide it
    const first = await activityAddEight ( engine ) ( i )
    const second = await activityAddFour ( engine ) ( first )
    const third = activityAddOne ( engine ) ( second )
    return third
  } )

describe ( "workflow", () => {
  it ( 'should execute a workflow', async () => {
    const store: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [], store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( result.instanceId ).toEqual ( workflowInstanceId )
    expect ( await result.result ).toBe ( 15 )

    expect ( metrics ).toEqual ( {
      "activity.attempts": 3,
      "activity.success": 3
    } )
    expect ( store ).toEqual ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
  } )
  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const store: BasicReplayEvents = [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 } ]
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )  //note that we don't need to pass the input here, as it is already in the store

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 2,
      "activity.replay.success": 1,
      "activity.success": 2
    } )
  } )
  it ( "should continue a workflow from a previous state when more work to do 2 ", async () => {
    const store: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 } ], store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [ { "id": "addone", "success": 15 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.replay.success": 2,
      "activity.success": 1
    } )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {
    const store: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 } ], store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
  it ( "should not allow continue if it's not yet created", async () => {
    const store: BasicReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [], store, metrics );
    const result = wfAdd13.complete ( engine, workflowInstanceId )
    expect ( result ).rejects.toThrowError ( "Parameters have not been recorded for this workflow instance {\"workflowId\":\"wfAdd13\",\"instanceId\":\"1\"}. Nothing in state" )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {} )
  } )
} )