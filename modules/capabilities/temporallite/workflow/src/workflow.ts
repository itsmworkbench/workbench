import { IncMetric, Injected, InjectedK0, InjectedK1, InjectedK2, InjectedK3, InjectedK4, InjectedK5, isParamsEvent, LoggingHookState, ReplayConfig, ReplayEvent, Sideeffect, UpdateReplayEventHistoryFn, withReplay } from "@itsmworkbench/kleislis";
import { ActivityEngine, } from "@itsmworkbench/activities";
import { workflowReplyEventProcessor } from "./workflow.replay";


export type IncMetricFn = ( wf: WorkflowAndInstanceId ) => IncMetric
export type SideeffectFn = ( wf: WorkflowAndInstanceId ) => Promise<Sideeffect>
export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
export type ExistingStateFn = ( wf: WorkflowAndInstanceId ) => Promise<ReplayEvent[]>
export type UpdateEventHistoryFn = ( wf: WorkflowAndInstanceId ) => UpdateReplayEventHistoryFn

export type WorkflowAndInstanceId = {
  workflowId: string
  instanceId: string

}
export interface WorkflowEngine {
  parent?: WorkflowAndInstanceId
  thisInstance?: WorkflowAndInstanceId
  nextInstanceId: NextInstanceIdFn
  incMetric?: IncMetricFn
  writeMetrics?: SideeffectFn
  existingState?: ExistingStateFn
  updateEventHistory?: UpdateEventHistoryFn
  logging?: LoggingHookState
}

export type ActivityEngineWithWorkflow = ActivityEngine & { workflowEngine: WorkflowEngine }
export async function workflowEngineToActivityEngine ( engine: WorkflowEngine, wf: WorkflowAndInstanceId ): Promise<ActivityEngineWithWorkflow> {
  const replayState = engine.existingState ? await engine.existingState ( wf ) : undefined
  const currentReplayIndex = 1; //the zeroth item is a params event. In complete we have already used this
  const incMetric = engine.incMetric ? engine.incMetric ( wf ) : undefined;
  return {
    currentReplayIndex,
    replayState,

    updateEventHistory: engine.updateEventHistory ? engine.updateEventHistory ( wf ) : undefined,
    incMetric,
    writeMetrics: engine.writeMetrics ? await engine.writeMetrics ( wf ) : undefined,
    logFn: engine.logging?.log,
    workflowEngine: engine,
  }
}

export interface WorkflowCommon {
  id: string
  workFlows?: Workflow<any>[]
}


export interface FullWorkflowResult<T> extends WorkflowAndInstanceId {
  result: Promise<T>
}
export type Workflow0<T> = (( engine: WorkflowEngine ) => () => Promise<T>) & {
  workflowId: string
  start: InjectedK0<WorkflowEngine, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<FullWorkflowResult<T>>
}
export type Workflow1<P1, T> = (( engine: WorkflowEngine ) => ( p1: P1 ) => Promise<T>) & {
  workflowId: string
  start: InjectedK1< WorkflowEngine,P1, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string) => Promise<FullWorkflowResult<T>>
}
export type Workflow2<P1, P2, T> = (( engine: WorkflowEngine ) => ( p1: P1, p2: P2 ) => Promise<T>) & {
  workflowId: string
  start: InjectedK2< WorkflowEngine,P1, P2, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string) => Promise<FullWorkflowResult<T>>
}
export type Workflow3<P1, P2, P3, T> = (( engine: WorkflowEngine ) => ( p1: P1, p2: P2, p3: P3 ) => Promise<T>) & {
  workflowId: string
  start: InjectedK3< WorkflowEngine,P1, P2, P3, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string) => Promise<FullWorkflowResult<T>>
}
export type Workflow4<P1, P2, P3, P4, T> = (( engine: WorkflowEngine ) => ( p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T>) & {
  workflowId: string
  start: InjectedK4< WorkflowEngine,P1, P2, P3, P4, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string) => Promise<FullWorkflowResult<T>>
}
export type Workflow5<P1, P2, P3, P4, P5, T> = (( engine: WorkflowEngine ) => ( p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T>) & {
  workflowId: string
  start: InjectedK5< WorkflowEngine,P1, P2, P3, P4, P5, FullWorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string) => Promise<FullWorkflowResult<T>>
}




export type Workflow<T> = Workflow0<T> | Workflow1<any, T> | Workflow2<any, any, T> | Workflow3<any, any, any, T> | Workflow4<any, any, any, any, T> | Workflow5<any, any, any, any, any, T>

export function workflow<T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow ) => Promise<T> ): Workflow0<T>
export function workflow<P1, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1 ) => Promise<T> ): Workflow1<P1, T>
export function workflow<P1, P2, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2 ) => Promise<T> ): Workflow2<P1, P2, T>
export function workflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3 ) => Promise<T> ): Workflow3<P1, P2, P3, T>
export function workflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): Workflow4<P1, P2, P3, P4, T>
export function workflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): Workflow5<P1, P2, P3, P4, P5, T>
export function workflow<T> ( common: WorkflowCommon, fn: ( engine: ActivityEngineWithWorkflow, ...args: any[] ) => Promise<T> ): Workflow<T> {

  const execute = async ( engine: WorkflowEngine, parentWf: WorkflowAndInstanceId | undefined, wf: WorkflowAndInstanceId, ...args: any[] ): Promise<FullWorkflowResult<T>> => {
    const workflowId = common.id;
    const activityEngine = await workflowEngineToActivityEngine ( engine, wf )

    const fn2 = ( ...args: any[] ) => {
      if ( parentWf === undefined )
        return fn ( activityEngine, ...args )
      else {
        const registeredWorkflows = listToObj ( common?.workFlows );
        const replayConfig: ReplayConfig = { eventProcessor: workflowReplyEventProcessor ( engine, registeredWorkflows ), shouldRecordResult: false }
        const fnWithReplay: Injected<ActivityEngine, T> = withReplay ( common.id, replayConfig, ( ...args: any[] ) => fn (activityEngine, ...args  ) )
        // @ts-ignore
        return fnWithReplay ( activityEngine ) ( ...args )
      }
    }
    return {
      ...wf,
      result: fn2 ( ...args ),
    }
  };
  function start ( thisEngine: WorkflowEngine ) {
    return async ( ...params: any[] ): Promise<FullWorkflowResult<T>> => {
      const instanceId = await thisEngine.nextInstanceId ( common.id );
      const wf: WorkflowAndInstanceId = { workflowId: common.id, instanceId }
      const existingState = await thisEngine.existingState ( wf )
      if ( existingState.length > 0 ) return complete ( thisEngine, instanceId )
      const newEngine: WorkflowEngine = { ...thisEngine, parent: thisEngine.thisInstance, thisInstance: wf }
      if ( thisEngine.thisInstance ) //if I have a parent I want to be recording that I have stared, so when we compete I can call this
        await thisEngine.updateEventHistory ( thisEngine.thisInstance ) ( { id: common.id, instanceId } )
      // else
      await thisEngine.updateEventHistory ( wf ) ( { id: common.id, params } );
      return await execute ( newEngine, thisEngine.thisInstance, wf, ...params );
    };
  }
  async function complete ( engine: WorkflowEngine, instanceId: string ): Promise<FullWorkflowResult<T>> {
    const wf: WorkflowAndInstanceId = { workflowId: common.id, instanceId }
    const state = await engine.existingState ( wf )
    if ( state === undefined ) throw new Error ( `No state found for workflow instance  ${JSON.stringify ( wf )}` )
    if ( state.length === 0 ) throw new Error ( `Parameters have not been recorded for this workflow instance ${JSON.stringify ( wf )}. Nothing in state` )
    const newEngine: WorkflowEngine = { ...engine, parent: engine.thisInstance, thisInstance: wf }
    if ( isParamsEvent ( state[ 0 ] ) ) {
      return execute ( newEngine, engine.thisInstance, wf, ...state[ 0 ].params )
    } else throw new Error ( `First event in state for  ${JSON.stringify ( wf )} is not a params event` )
  }
  const result = ( e: WorkflowEngine ) => ( ...args: any[] ): Promise<T> => {
    return start ( e ) ( ...args ).then ( r => r.result )
  }
  result[ 'workflowId' ] = common.id
  result[ 'start' ] = start
  result[ 'complete' ] = complete
  return result as Workflow<T>

}


export function listToObj<T> ( list: Workflow<T>[] | undefined ): { [ key: string ]: Workflow<T> } {
  if ( list === undefined ) return {}
  return list.reduce ( ( acc, item ) => {
    acc[ item.workflowId ] = item
    return acc
  }, {} )
}