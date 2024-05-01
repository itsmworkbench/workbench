import { IncMetric, Injected, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, isParamsEvent, ReplayEvent, ReplayConfig, Sideeffect, UpdateReplayEventHistoryFn, withReplay } from "@itsmworkbench/kleislis";
import { ActivityEngine, } from "@itsmworkbench/activities";
import { LoggingHookState } from "@itsmworkbench/nodekleislis";
import { workflowReplyEventProcessor } from "./workflow.replay";
import { NameAnd } from "@laoban/utils";


export type IncMetricFn = ( workflowInstanceId: string ) => IncMetric
export type SideeffectFn = ( workflowInstanceId: string ) => Promise<Sideeffect>
export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
export type ExistingStateFn = ( workflowInstanceId: string ) => Promise<ReplayEvent[]>
export type UpdateEventHistoryFn = ( workflowInstanceId: string ) => UpdateReplayEventHistoryFn

export interface WorkflowEngine {
  thisInstanceId?: string
  nextInstanceId: NextInstanceIdFn
  incMetric?: IncMetricFn
  writeMetrics?: SideeffectFn
  existingState?: ExistingStateFn
  updateEventHistory?: UpdateEventHistoryFn
  logging?: LoggingHookState
}

export type ActivityEngineWithWorkflow = ActivityEngine & { workflowEngine: WorkflowEngine }
export async function workflowEngineToActivityEngine ( engine: WorkflowEngine, workflowInstanceId: string ): Promise<ActivityEngineWithWorkflow> {
  const replayState = engine.existingState ? await engine.existingState ( workflowInstanceId ) : undefined
  const currentReplayIndex = 1; //the zeroth item is a params event. In complete we have already used this
  const incMetric = engine.incMetric ? engine.incMetric ( workflowInstanceId ) : undefined;
  return {
    currentReplayIndex,
    replayState,

    updateEventHistory: engine.updateEventHistory ? engine.updateEventHistory ( workflowInstanceId ) : undefined,
    incMetric,
    writeMetrics: engine.writeMetrics ? await engine.writeMetrics ( workflowInstanceId ) : undefined,
    logFn: engine.logging?.log,
    workflowEngine: engine,

  }
}

export interface WorkflowCommon {
  id: string
  workFlows?: Workflow<any>[]
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
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
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

export function workflow<T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow ) => Promise<T> ): Workflow0<T>
export function workflow<P1, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1 ) => Promise<T> ): Workflow1<P1, T>
export function workflow<P1, P2, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2 ) => Promise<T> ): Workflow2<P1, P2, T>
export function workflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3 ) => Promise<T> ): Workflow3<P1, P2, P3, T>
export function workflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): Workflow4<P1, P2, P3, P4, T>
export function workflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): Workflow5<P1, P2, P3, P4, P5, T>
export function workflow<T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, ...args: any[] ) => Promise<T> ): Workflow<T> {
  const result = { complete, start, workflowId: common.id };
  const execute = async ( engine: WorkflowEngine, parentInstanceId: string | undefined, workflowInstanceId: string, ...args: any[] ): Promise<WorkflowResult<T>> => {
    const workflowId = common.id;
    const activityEngine = await workflowEngineToActivityEngine ( engine, workflowInstanceId )

    const fn2 = ( ...args: any[] ) => {
      if ( parentInstanceId === undefined )
        return fn ( activityEngine, ...args )
      else {
        const registeredWorkflows = listToObj ( common?.workFlows );
        const replayConfig: ReplayConfig = { eventProcessor: workflowReplyEventProcessor ( engine,{ [common.id]: result} ), shouldRecordResult: false }
        const fnWithReplay: Injected<ActivityEngine, T> = withReplay ( common.id, replayConfig, ( ...args: any[] ) => fn ( ...[ activityEngine, ...args ] ) )
        // @ts-ignore
        return fnWithReplay ( activityEngine ) ( ...args )
      }
    }
    return {
      workflowId,
      instanceId: workflowInstanceId,
      result: fn2 ( ...args ),
    }
  };
  function start ( thisEngine: WorkflowEngine ) {
    return async ( ...params: any[] ): Promise<WorkflowResult<T>> => {
      const instanceId = await thisEngine.nextInstanceId ( common.id );
      const newEngine = { ...thisEngine, thisInstanceId: instanceId }
      if ( thisEngine.thisInstanceId )
        await thisEngine.updateEventHistory ( thisEngine.thisInstanceId ) ( { id: common.id, instanceId } )
      // else
        await thisEngine.updateEventHistory ( instanceId ) ( { id: common.id, params } );
      return await execute ( newEngine, thisEngine.thisInstanceId, instanceId, ...params );
    };
  }
  async function complete ( engine: WorkflowEngine, workflowInstanceId: string ): Promise<WorkflowResult<T>> {
    const state = await engine.existingState ( workflowInstanceId )
    if ( state === undefined ) throw new Error ( `No state found for workflow instance  ${workflowInstanceId}` )
    if ( state.length === 0 ) throw new Error ( `Parameters have not been recorded for this workflow instance ${workflowInstanceId}. Nothing in state` )
    const newEngine = { ...engine, thisInstanceId: workflowInstanceId }
    if ( isParamsEvent ( state[ 0 ] ) ) {
      return execute ( newEngine, engine.thisInstanceId, workflowInstanceId, ...state[ 0 ].params )
    } else throw new Error ( `First event in state for  ${workflowInstanceId} is not a params event` )
  }
  return result
}


export function listToObj<T> ( list: Workflow<T>[] | undefined ): { [ key: string ]: Workflow<T> } {
  if ( list === undefined ) return {}
  return list.reduce ( ( acc, item ) => {
    acc[ item.workflowId ] = item
    return acc
  }, {} )
}