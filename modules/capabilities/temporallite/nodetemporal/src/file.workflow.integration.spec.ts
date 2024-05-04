import { activity, } from "@itsmworkbench/activities";
import { NameAnd } from "@laoban/utils";
import { fileWorkflowEngine } from "./file.workflow.engine";
import { defaultFileNamesForTemporal } from "./filenames";
import { Workflow, workflow, Workflow1, WorkflowEngine } from "@itsmworkbench/workflow";
import { createTempDir, loadEvents, loadMetrics, setEvents } from "./filenames.fixtures";
import { nodeActivity, NodeWorkflow, nodeWorkflow, NodeWorkflow1, runWithWorkflowEngine } from "@itsmworkbench/nodekleislis";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";

const timeService = (): number => Date.UTC ( 2024, 3, 27, 14, 30, 0 );

function names ( workspace: string ) {
  return defaultFileNamesForTemporal ( { timeService, workspace, template: '{seq}.events' } )
}
export const activityAddOne = nodeActivity ( { id: 'addone', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => {
    const result = input + 1;
    return result;
  } )
export const activityAddFour = nodeActivity ( { id: 'addfour', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 4 )
export const activityAddEight = nodeActivity ( { id: 'addeight', retry: defaultRetryPolicy },
  async ( input: number ): Promise<number> => input + 8 )
export const wfAdd13: NodeWorkflow1<number, number> = nodeWorkflow ( { id: 'wfAdd13' },
  async ( i: number ) => activityAddOne ( await activityAddFour ( await activityAddEight ( i ) ) ) )
const wf = { workflowId: wfAdd13.workflowId, instanceId: 'instanceId' };

export function allButLastSegment ( path: string ) {
  return path.split ( '/' ).slice ( 0, -1 ).join ( '/' )
}
describe ( "workflow", () => {
  let workspace: string
  beforeEach ( async () => {
    workspace = await createTempDir ();
  } );

  afterEach ( async () => {
    console.log ( 'workspace', workspace )
    // await removeTempDir ( workspace );
  } );

  it ( 'should execute a workflow', async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );
    const result = await runWithWorkflowEngine ( engine, () => wfAdd13 ( 2 ) )

    expect ( result ).toEqual ( 'wfAdd13' )

    //unfortunately by using 'the normal run' we have lost the instance id. We do have the start method which is tested next
    // const events = await loadEvents ( names ( workspace ), result )
    // expect ( events ).toEqual (
    //   [
    //     { "id": "addeight", "success": 10 },
    //     { "id": "addfour", "success": 14 },
    //     { "id": "addone", "success": 15 }
    //   ] )
  } )
  it ( 'should execute a workflow using start', async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );
    const result = await runWithWorkflowEngine ( engine, () => wfAdd13.start ( 2 ) )

    expect ( result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( allButLastSegment ( result.instanceId ) ).toEqual ( "wfAdd13/2024-04/27-14/30" )
    expect ( await result.result ).toBe ( 15 )

    const events = await loadEvents ( names ( workspace ), result )
    expect ( events ).toEqual (
      [
        { "id": "addeight", "success": 10 },
        { "id": "addfour", "success": 14 },
        { "id": "addone", "success": 15 }
      ] )
  } )
  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ), undefined );

    await setEvents ( names ( workspace ), wf, [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 } ] )
    const result = await runWithWorkflowEngine ( engine, () => wfAdd13.complete ( wf.instanceId ) )

    expect ( await result.result ).toBe ( 15 )

    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result );
    const events = await loadEvents ( names ( workspace ), result )
    expect ( events ).toEqual ( [
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


    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );

    await setEvents ( names ( workspace ), wf, [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 } ] )
    const actualEvents = await loadEvents ( names ( workspace ), wf )
    console.log ( 'actualEvents', actualEvents )

    const result = await runWithWorkflowEngine ( engine, () => wfAdd13.complete ( wf.instanceId ) )

    expect ( await result.result ).toBe ( 15 )
    const events = await loadEvents ( names ( workspace ), result )
    expect ( events ).toEqual ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result );
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.replay.success": 2,
      "activity.success": 1
    } )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );
    await setEvents ( names ( workspace ), wf, [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 } ] )
    const result = await runWithWorkflowEngine ( engine, () => wfAdd13.complete ( wf.instanceId ) )

    expect ( await result.result ).toBe ( 15 )
    const events = await loadEvents ( names ( workspace ), result )
    expect ( events ).toEqual ( [
      { "id": "wfAdd13", "params": [ 2 ] },
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result );
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
} )