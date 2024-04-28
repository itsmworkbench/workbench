import { activity, ActivityEvents } from "@itsmworkbench/activities";
import { NameAnd } from "@laoban/utils";
import { fileWorkflowEngine } from "./file.workflow.engine";
import { defaultFileNamesForTemporal } from "./filenames";
import { Workflow, workflow, Workflow1, WorkflowEngine } from "@itsmworkbench/workflow";
import { createTempDir, loadEvents, loadMetrics, setEvents } from "./filenames.fixtures";

const timeService = (): number => Date.UTC ( 2024, 3, 27, 14, 30, 0 );

function names ( workspace: string ) {
  return defaultFileNamesForTemporal ( { timeService, workspace, template: '{seq}.events' } )
}
export const activityAddOne = activity ( { id: 'addone' },
  async ( input: number ): Promise<number> => {
    const result = input + 1;
    return result;
  } )
export const activityAddFour = activity ( { id: 'addfour' },
  async ( input: number ): Promise<number> => input + 4 )
export const activityAddEight = activity ( { id: 'addeight' },
  async ( input: number ): Promise<number> => input + 8 )
export const wfAdd13: Workflow1<number, number> = workflow ( { id: 'wfAdd13' },
  async ( i: number ) => activityAddOne ( await activityAddFour ( await activityAddEight ( i ) ) ) )

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
    const result = await wfAdd13.start ( engine, 2 )

    expect ( await result.workflowId ).toEqual ( 'wfAdd13' )
    expect ( await result.result ).toBe ( 15 )
    const events = await loadEvents ( names ( workspace ), result.instanceId )
    expect ( events ).toEqual (
      [
        { "id": "addeight", "success": 10 },
        { "id": "addfour", "success": 14 },
        { "id": "addone", "success": 15 }
      ] )
  } )
  it ( "should continue a workflow from a previous state when more work to do 1 ", async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ), 'instanceId' );

    await setEvents ( names ( workspace ), 'instanceId', [ { "id": "addeight", "success": 10 } ] )
    const result = await wfAdd13.complete ( engine, 'instanceId', 2 ) //this should be a continue command not a start command

    expect ( await result.result ).toBe ( 15 )

    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result.instanceId );
    expect ( metrics ).toEqual ( {
      "activity.attempts": 2,
      "activity.replay.success": 1,
      "activity.success": 2
    } )
    const events = await loadEvents ( names ( workspace ), result.instanceId )
    expect ( events ).toEqual ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
  } )
  it ( "should continue a workflow from a previous state when more work to do 2 ", async () => {


    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );

    await setEvents ( names ( workspace ), 'instanceId', [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 } ] )
    const actualEvents = await loadEvents ( names ( workspace ), 'instanceId' )
    console.log ( 'actualEvents', actualEvents )

    const result = await wfAdd13.complete ( engine, 'instanceId', 2 )

    expect ( await result.result ).toBe ( 15 )
    const events = await loadEvents ( names ( workspace ), result.instanceId )
    expect ( events ).toEqual ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result.instanceId );
    expect ( metrics ).toEqual ( {
      "activity.attempts": 1,
      "activity.replay.success": 2,
      "activity.success": 1
    } )
  } )
  it ( "should continue a workflow from a previous state when no more work", async () => {
    const engine: WorkflowEngine = fileWorkflowEngine ( names ( workspace ) );
    await setEvents ( names ( workspace ), 'instanceId', [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 } ] )
    const result = await wfAdd13.complete ( engine, 'instanceId', 2 )

    expect ( await result.result ).toBe ( 15 )
    const events = await loadEvents ( names ( workspace ), result.instanceId )
    expect ( events ).toEqual ( [
      { "id": "addeight", "success": 10 },
      { "id": "addfour", "success": 14 },
      { "id": "addone", "success": 15 }
    ] )
    let metrics: NameAnd<number> = await loadMetrics ( names ( workspace ), result.instanceId );
    expect ( metrics ).toEqual ( {
      "activity.replay.success": 3
    } )
  } )
} )