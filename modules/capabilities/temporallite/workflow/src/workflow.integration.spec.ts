import { workflow, WorkflowEngine } from "./workflow";
import { NameAnd } from "@laoban/utils";
import { activity, ActivityEngine } from "@itsmworkbench/activities";
import { defaultRetryPolicy, inMemoryIncMetric, rememberUpdateCache, ReplayEvents } from "@itsmworkbench/kleislis";

export function makeWorkflowEngine ( existing: ReplayEvents, store: ReplayEvents, metrics: NameAnd<number> ): WorkflowEngine {
  return {
    incMetric: () => inMemoryIncMetric ( metrics ),
    existingState: async ( id: string ) => existing,
    updateEventHistory: () => rememberUpdateCache ( store ),
    nextInstanceId: async ( workflowId: string ) => '1'
  }
}
export const activityAddOne = activity ( { id: 'addone' , retry: defaultRetryPolicy},
  async ( input: number ): Promise<number> => input + 1 )
export const activityAddFour = activity ( { id: 'addfour' , retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 4 )
export const activityAddEight = activity ( { id: 'addeight' , retry: defaultRetryPolicy },
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
    const store: ReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [], store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( result.instanceId ).toEqual ( "1" )
    expect ( await result.result ).toBe ( 15 )

    expect ( metrics ).toEqual ( {
      "activity.attempts": 3,
      "activity.success": 3
    } )
    expect ( store ).toEqual ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
  } )
  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const store: ReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [
      { "id": "addeight", "success": 10 } ], store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [
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
    const store: ReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 } ], store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [ { "id": "addone", "success": 15 } ] )
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.replay.success": 2,
      "activity.success": 1
    } )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {
    const store: ReplayEvents = []
    let metrics: NameAnd<number> = {};
    const engine: WorkflowEngine = makeWorkflowEngine ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 } ], store, metrics );
    const result = await wfAdd13.start ( engine ) ( 2 )

    expect ( await result.result ).toBe ( 15 )
    expect ( store ).toEqual ( [] )
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
} )