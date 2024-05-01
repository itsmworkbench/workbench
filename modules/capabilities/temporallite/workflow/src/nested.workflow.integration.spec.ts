import { ActivityEngineWithWorkflow, workflow, WorkflowEngine } from "./workflow";
import { NameAnd } from "@laoban/utils";
import { ActivityEngine } from "@itsmworkbench/activities";
import { BasicReplayEvent, BasicReplayEvents, inMemoryIncMetric, rememberUpdateCache } from "@itsmworkbench/kleislis";
import { WorkflowEvent } from "./workflow.replay";

const workflowInstanceId = "1";
type Store = NameAnd<(BasicReplayEvent | WorkflowEvent)[]>

export function makeWorkflowEngine ( existing: Store, store: Store, metrics: NameAnd<number> ): WorkflowEngine {
  return {
    incMetric: () => inMemoryIncMetric ( metrics ),
    existingState: async ( id: string ) => {
      const events = existing[ id ]
      return events ? events : [];
    },
    updateEventHistory: ( id ) => {
      if ( !store[ id ] ) store[ id ] = []
      return rememberUpdateCache ( store[ id ] )
    },
    nextInstanceId: async ( workflowId: string ) =>  workflowInstanceId,
  }
}
export const workflowAddOne = workflow ( { id: 'addone' },
  async ( engine: ActivityEngine, input: number ): Promise<number> =>
    input + 1 )
export const workflowAddFour = workflow ( { id: 'addfour' },
  async ( engine: ActivityEngine, input: number ): Promise<number> =>
    input + 4 )
export const workflowAddEight = workflow ( { id: 'addeight' },
  async ( engine: ActivityEngine, input: number ): Promise<number> =>
    input + 8 )
export const wfAdd13 = workflow ( { id: 'wfAdd13', workFlows: [ workflowAddEight, workflowAddFour, workflowAddOne ] },
  async ( engine: ActivityEngineWithWorkflow, i: number ) => { //wow this sucks. All this rubbish with (engine). Need to move to zoom/nodeactivities and hide it
    const first = await workflowAddEight.start ( engine.workflowEngine ) ( i )
    const second = await workflowAddFour.start ( engine.workflowEngine ) ( await first.result )
    const third = await workflowAddOne.start ( engine.workflowEngine ) ( await second.result )
    return await third.result
  } )

describe ( "workflow that calls another workflow", () => {
  it ( 'should execute a workflow', async () => {
    const store: Store = {}
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( {}, store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( result.instanceId ).toEqual ( 'wfAdd13_1' )
    expect ( await result.result ).toBe ( 15 )

    expect ( metrics ).toEqual ( {} )
    expect ( store ).toEqual ( {
      "addeight_1": [ { "id": "addeight", "params": [ 2 ] } ],
      "addfour_1": [ { "id": "addfour", "params": [ 10 ] } ],
      "addone_1": [ { "id": "addone", "params": [ 14 ] } ],
      "wfAdd13_1": [
        { "id": "wfAdd13", "params": [ 2 ] },
        { "id": "addeight", "instanceId": "addeight_1" },
        { "id": "addfour", "instanceId": "addfour_1" },
        { "id": "addone", "instanceId": "addone_1" }
      ]
    } )
  } )

  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const store: Store ={
      "addeight_1": [ { "id": "addeight", "params": [ 2 ] } ],
      "wfAdd13_1": [
        { "id": "wfAdd13", "params": [ 2 ] },
        { "id": "addeight", "instanceId": "addeight_1" },
      ]
    }
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, wfAdd13.workflowId + '_'+ workflowInstanceId )  //note that we don't need to pass the input here, as it is already in the store

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
    let metrics: NameAnd<number> = {};
    const store: Store = {
      "wfAdd131": [
        { "id": "wfAdd13", "params": [ 2 ] },
        { "id": "addeight", "instanceId": "1" },
        { "id": "addfour", "success": 14 }
      ]
    }
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
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

    let metrics: NameAnd<number> = {};
    const store: Store = {
      "wfAdd131": [
        { "id": "wfAdd13", "params": [ 2 ] },
        { "id": "addeight", "success": 10 },
        { "id": "addfour", "success": 14 },
        { "id": "addone", "success": 15 } ]
    };
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
  it ( "should not allow continue if it's not yet created", async () => {
    const store: Store = {}
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = wfAdd13.complete ( engine, workflowInstanceId )
    expect ( result ).rejects.toThrowError ( 'Parameters have not been recorded for this workflow instance. Nothing in state' )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {} )
  } )
} )