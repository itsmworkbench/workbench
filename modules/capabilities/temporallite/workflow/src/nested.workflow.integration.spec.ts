import { ActivityEngineWithWorkflow, workflow, WorkflowEngine } from "./workflow";
import { NameAnd } from "@laoban/utils";
import { ActivityEngine } from "@itsmworkbench/activities";
import { BasicReplayEvent, inMemoryIncMetric, rememberUpdateCache } from "@itsmworkbench/kleislis";
import { WorkflowEvent } from "./workflow.replay";

const workflowInstanceId = "1";
type Store = NameAnd<NameAnd<(BasicReplayEvent | WorkflowEvent)[]>>

export function makeWorkflowEngine ( existing: Store, store: Store, metrics: NameAnd<number> ): WorkflowEngine {
  return {
    incMetric: () => inMemoryIncMetric ( metrics ),
    existingState: async ( wf ) => {
      const events = existing[ wf.workflowId ]?.[ wf.instanceId ]
      return events ? events : [];
    },
    updateEventHistory: ( wf ) => {
      const { workflowId, instanceId } = wf
      if ( !store[ workflowId ] ) store[ workflowId ] = {}
      if ( !store[ workflowId ][ instanceId ] ) store[ workflowId ][ instanceId ] = []
      return rememberUpdateCache ( store[ workflowId ][ instanceId ] )
    },
    nextInstanceId: async ( workflowId: string ) => workflowInstanceId,
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
  async ( engine: ActivityEngineWithWorkflow, i: number ) => {
    const e = engine.workflowEngine; //we can get rid of this with nodeworkflow... but really hard in react
    const first = await workflowAddEight ( e ) ( i )
    const second = await workflowAddFour ( e ) ( first )
    const third = await workflowAddOne ( e ) ( second )
    return third
  } )

describe ( "workflow that calls another workflow", () => {
  it ( 'should execute a workflow', async () => {
    const store: Store = {}
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( {}, store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( result.instanceId ).toEqual ( '1' )
    expect ( await result.result ).toBe ( 15 )

    expect ( metrics ).toEqual ( {} )
    expect ( store ).toEqual ( {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "addone": { "1": [ { "id": "addone", "params": [ 14 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
          { "id": "addone", "instanceId": "1" }
        ]
      }
    } )
  } )

  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const store: Store = {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
        ]
      }
    }
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )  //note that we don't need to pass the input here, as it is already in the store

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "addone": { "1": [ { "id": "addone", "params": [ 14 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
          { "id": "addone", "instanceId": "1" }
        ]
      }
    } )
  } )
  it ( "should continue a workflow from a previous state when more work to do 2 ", async () => {
    let metrics: NameAnd<number> = {};
    const store: Store = {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
        ]
      }
    }
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "addone": { "1": [ { "id": "addone", "params": [ 14 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
          { "id": "addone", "instanceId": "1" }
        ]
      }
    } )
    expect ( metrics ).toEqual ( {} )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {

    let metrics: NameAnd<number> = {};
    const store: Store = {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "addone": { "1": [ { "id": "addone", "params": [ 14 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
          { "id": "addone", "instanceId": "1" }
        ]
      }
    }
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    const result = await wfAdd13.complete ( engine, workflowInstanceId )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( {
      "addeight": { "1": [ { "id": "addeight", "params": [ 2 ] } ] },
      "addfour": { "1": [ { "id": "addfour", "params": [ 10 ] } ] },
      "addone": { "1": [ { "id": "addone", "params": [ 14 ] } ] },
      "wfAdd13": {
        "1": [
          { "id": "wfAdd13", "params": [ 2 ] },
          { "id": "addeight", "instanceId": "1" },
          { "id": "addfour", "instanceId": "1" },
          { "id": "addone", "instanceId": "1" }
        ]
      }
    } )
    expect ( metrics ).toEqual ( {} )
  } )
  it ( "should not allow continue if it's not yet created", async () => {
    const store: Store = {}
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( store, store, metrics );
    try {
      const res = await wfAdd13.complete ( engine, workflowInstanceId )
    } catch ( e ) {
      expect ( e.message ).toEqual ( 'Parameters have not been recorded for this workflow instance {"workflowId":"wfAdd13","instanceId":"1"}. Nothing in state' )
    }
    expect ( store ).toEqual ( {} )
    expect ( metrics ).toEqual ( {} )
  } )
} )