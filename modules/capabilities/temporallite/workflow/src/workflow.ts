import { IncMetric, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, isParamsEvent, ReplayEvent, ReplayEvents, replyEventProcessor, Sideeffect } from "@itsmworkbench/kleislis";
import { ActivityEngine, } from "@itsmworkbench/activities";
import { LoggingHookState } from "@itsmworkbench/nodekleislis";


export type IncMetricFn = ( workflowInstanceId: string ) => IncMetric
export type SideeffectFn = ( workflowInstanceId: string ) => Promise<Sideeffect>
export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
export type ExistingStateFn = ( workflowInstanceId: string ) => Promise<ReplayEvents>
export type UpdateEventHistoryFn = ( workflowInstanceId: string ) => ( e: ReplayEvent ) => Promise<void>

export interface WorkflowEngine {
  nextInstanceId: NextInstanceIdFn
  incMetric?: IncMetricFn
  writeMetrics?: SideeffectFn
  existingState?: ExistingStateFn
  updateEventHistory?: UpdateEventHistoryFn
  logging?: LoggingHookState

}
export async function workflowEngineToActivityEngine ( engine: WorkflowEngine, workflowInstanceId: string ): Promise<ActivityEngine> {
  const replayState = engine.existingState ? await engine.existingState ( workflowInstanceId ) : undefined
  const currentReplayIndex = 1; //the zeroth item is a params event. In complete we have already used this
  const incMetric = engine.incMetric ? engine.incMetric ( workflowInstanceId ) : undefined;
  return {
    currentReplayIndex,
    replayState,
    eventProcessor:replyEventProcessor(incMetric),
    updateEventHistory: engine.updateEventHistory ? engine.updateEventHistory ( workflowInstanceId ) : undefined,
    incMetric,
    writeMetrics: engine.writeMetrics ? await engine.writeMetrics ( workflowInstanceId ) : undefined,
    logFn: engine.logging?.log
  }
}

export interface WorkflowCommon {
  id: string
}


export type WorkflowResult<T> = {
  result: Promise<T>
  workflowId: string
  instanceId: string
}
export type Workflow0<T> = {
  workflowId: string
  start: InjectedK0<WorkflowEngine, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow1<P1, T> = {
  workflowId: string
  start: InjectedK1<WorkflowEngine, P1, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow2<P1, P2, T> = {
  workflowId: string
  start: InjectedK2<WorkflowEngine, P1, P2, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1, p2: P2 ) => Promise<WorkflowResult<T>>
}
export type Workflow3<P1, P2, P3, T> = {
  workflowId: string
  start: InjectedK3<WorkflowEngine, P1, P2, P3, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow4<P1, P2, P3, P4, T> = {
  workflowId: string
  start: InjectedK4<WorkflowEngine, P1, P2, P3, P4, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow5<P1, P2, P3, P4, P5, T> = {
  workflowId: string
  start: InjectedK5<WorkflowEngine, P1, P2, P3, P4, P5, WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow<T> = Workflow0<T> | Workflow1<any, T> | Workflow2<any, any, T> | Workflow3<any, any, any, T> | Workflow4<any, any, any, any, T> | Workflow5<any, any, any, any, any, T>

export function workflow<T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine ) => Promise<T> ): Workflow0<T>
export function workflow<P1, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine, p1: P1 ) => Promise<T> ): Workflow1<P1, T>
export function workflow<P1, P2, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine, p1: P1, p2: P2 ) => Promise<T> ): Workflow2<P1, P2, T>
export function workflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine, p1: P1, p2: P2, p3: P3 ) => Promise<T> ): Workflow3<P1, P2, P3, T>
export function workflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): Workflow4<P1, P2, P3, P4, T>
export function workflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngine, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): Workflow5<P1, P2, P3, P4, P5, T>
export function workflow<T> ( common: WorkflowCommon, fn: ( ...args: any[] ) => Promise<T> ): Workflow<T> {
  const execute = async ( engine: WorkflowEngine, workflowInstanceId: string, ...args: any[] ): Promise<WorkflowResult<T>> => {
    const workflowId = common.id;
    const activityEngine = await workflowEngineToActivityEngine ( engine, workflowInstanceId )
    return {
      workflowId,
      instanceId: workflowInstanceId,
      result: fn ( activityEngine, ...args ),
    }
  };
  const start = ( engine: WorkflowEngine ) => async ( ...params: any[] ): Promise<WorkflowResult<T>> => {
    const instanceId = await engine.nextInstanceId ( common.id );
    await engine.updateEventHistory ( instanceId ) ( { id: common.id, params } );
    return await execute ( engine, instanceId, ...params );
  }
  const complete = async ( engine: WorkflowEngine, workflowInstanceId: string ): Promise<WorkflowResult<T>> => {
    const state = await engine.existingState ( workflowInstanceId )
    if ( state === undefined ) throw new Error ( 'No state found for workflow instance' )
    if ( state.length === 0 ) throw new Error ( 'Parameters have not been recorded for this workflow instance. Nothing in state' )
    if ( isParamsEvent ( state[ 0 ] ) ) {
      return execute ( engine, workflowInstanceId, ...state[ 0 ].params )
    } else throw new Error ( 'First event in state is not a params event' )
  }
  return { complete, start, workflowId: common.id }
}


