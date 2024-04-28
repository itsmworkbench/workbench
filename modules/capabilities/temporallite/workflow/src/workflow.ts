import { IncMetric, MetricHookState, Sideeffect } from "@itsmworkbench/kleislis";
import { ActivityEvent, ActivityEvents, runWithWorkflowLogsAndMetrics, WorkflowHookState } from "@itsmworkbench/activities";


export type IncMetricFn = ( workflowInstanceId: string ) => IncMetric
export type SideeffectFn = ( workflowInstanceId: string ) => Promise<Sideeffect>
export type NextInstanceIdFn = ( workflowId: string ) => Promise<string>
export type ExistingStateFn = ( workflowInstanceId: string ) => Promise<ActivityEvents>
export type UpdateEventHistoryFn = ( workflowInstanceId: string ) => ( e: ActivityEvent ) => Promise<void>

export type WorkflowEngine = {
  incMetric: IncMetricFn
  writeMetrics?: SideeffectFn
  nextInstanceId: NextInstanceIdFn
  existingState: ExistingStateFn
  updateEventHistory: UpdateEventHistoryFn
}
export type WorkflowCommon = {
  id: string
}


export type WorkflowResult<T> = {
  result: Promise<T>
  workflowId: string
  instanceId: string
}
export type Workflow0<T> = {
  workflowId: string
  start: ( engine: WorkflowEngine ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type Workflow1<P1, T> = {
  workflowId: string
  start: ( engine: WorkflowEngine, p1: P1 ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1 ) => Promise<WorkflowResult<T>>
}
export type Workflow2<P1, P2, T> = {
  workflowId: string
  start: ( engine: WorkflowEngine, p1: P1, p2: P2 ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1, p2: P2 ) => Promise<WorkflowResult<T>>
}
export type Workflow3<P1, P2, P3, T> = {
  workflowId: string
  start: ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3 ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1, p2: P2, p3: P3 ) => Promise<WorkflowResult<T>>
}
export type Workflow4<P1, P2, P3, P4, T> = {
  workflowId: string
  start: ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<WorkflowResult<T>>
}
export type Workflow5<P1, P2, P3, P4, P5, T> = {
  workflowId: string
  start: ( engine: WorkflowEngine, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<WorkflowResult<T>>
  complete: ( engine: WorkflowEngine, workflowInstanceId: string, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<WorkflowResult<T>>
}

export type Workflow<T> = Workflow0<T> | Workflow1<any, T> | Workflow2<any, any, T> | Workflow3<any, any, any, T> | Workflow4<any, any, any, any, T> | Workflow5<any, any, any, any, any, T>

export function workflow<T> ( common: WorkflowCommon, fn: () => Promise<T> ): Workflow0<T>
export function workflow<P1, T> ( common: WorkflowCommon, fn: ( p1: P1 ) => Promise<T> ): Workflow1<P1, T>
export function workflow<P1, P2, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2 ) => Promise<T> ): Workflow2<P1, P2, T>
export function workflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3 ) => Promise<T> ): Workflow3<P1, P2, P3, T>
export function workflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): Workflow4<P1, P2, P3, P4, T>
export function workflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): Workflow5<P1, P2, P3, P4, P5, T>

export function workflow<T> ( common: WorkflowCommon, fn: ( ...args: any[] ) => Promise<T> ): Workflow<T> {
  async function complete ( engine: WorkflowEngine, workflowInstanceId: string,... args: any[] ) {
    const workflowId = common.id;
    const { incMetric,  writeMetrics } = engine
    const replayState = await engine.existingState ( workflowInstanceId );
    const store: WorkflowHookState = {
      currentReplayIndex: 0, workflowId, workflowInstanceId,
      replayState: replayState, updateEventHistory: engine.updateEventHistory ( workflowInstanceId )
    }
    const metricsState: MetricHookState = {
      incMetric: incMetric ( workflowInstanceId ),
      writeMetrics: writeMetrics ? await writeMetrics ( workflowInstanceId ) : undefined
    };
    return {
      workflowId,
      instanceId: workflowInstanceId,
      result: runWithWorkflowLogsAndMetrics ( store, metricsState, {},
        () => {
          return fn ( ...args );
        } ),
    }
  }
  const start: ( engine: WorkflowEngine, ...args: any[] ) => Promise<WorkflowResult<T>> =
          async ( engine: WorkflowEngine, ...args: any[] ): Promise<WorkflowResult<T>> =>
            await complete ( engine, await engine.nextInstanceId ( common.id ), ...args )
  return { start, complete, workflowId: common.id }
}
