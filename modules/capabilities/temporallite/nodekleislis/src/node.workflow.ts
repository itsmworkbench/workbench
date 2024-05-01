import { K0, K1, K2, K3, K4, K5 } from "@itsmworkbench/kleislis";
import { WorkflowAndInstanceId, WorkflowCommon, WorkflowEngine, workflowEngineToActivityEngine, WorkflowResult } from "@itsmworkbench/workflow";
import { runWithLoggedActivityEngine } from "./node.activities";
import { AsyncLocalStorage } from "async_hooks";


const workflowEngineState = new AsyncLocalStorage<WorkflowEngine> ()

export function runWithWorkflowEngine<T> ( state: WorkflowEngine, fn: () => T ): T {
  return workflowEngineState.run ( state, fn )
}
export function useWorkflowEngine (): WorkflowEngine {
  const store = workflowEngineState.getStore ()
  if ( store ) {
    return store
  }
  throw new Error ( 'Workflow Engine not available' )
}
export type NodeWorkflow0<T> = {
  workflowId: string
  start: K0<WorkflowResult<T>>
  complete: ( workflowInstanceId: string ) => Promise<WorkflowResult<T>>
}
export type NodeWorkflow1<P1, T> = {
  workflowId: string
  start: K1<P1, WorkflowResult<T>>
  complete: ( workflowInstanceId: string, p1: P1 ) => Promise<WorkflowResult<T>>
}
export type NodeWorkflow2<P1, P2, T> = {
  workflowId: string
  start: K2<P1, P2, WorkflowResult<T>>
  complete: ( workflowInstanceId: string, p1: P1, p2: P2 ) => Promise<WorkflowResult<T>>
}
export type NodeWorkflow3<P1, P2, P3, T> = {
  workflowId: string
  start: K3<P1, P2, P3, WorkflowResult<T>>
  complete: ( workflowInstanceId: string, p1: P1, p2: P2, p3: P3 ) => Promise<WorkflowResult<T>>
}
export type NodeWorkflow4<P1, P2, P3, P4, T> = {
  workflowId: string
  start: K4<P1, P2, P3, P4, WorkflowResult<T>>
  complete: ( workflowInstanceId: string, p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<WorkflowResult<T>>
}
export type NodeWorkflow5<P1, P2, P3, P4, P5, T> = {
  workflowId: string
  start: K5<P1, P2, P3, P4, P5, WorkflowResult<T>>
  complete: ( workflowInstanceId: string, p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<WorkflowResult<T>>
}

export type  NodeWorkflow<T> = NodeWorkflow0<T> | NodeWorkflow1<any, T> | NodeWorkflow2<any, any, T> | NodeWorkflow3<any, any, any, T> | NodeWorkflow4<any, any, any, any, T> | NodeWorkflow5<any, any, any, any, any, T>

export function nodeWorkflow<T> ( common: WorkflowCommon, fn: () => Promise<T> ): NodeWorkflow0<T>
export function nodeWorkflow<P1, T> ( common: WorkflowCommon, fn: ( p1: P1 ) => Promise<T> ): NodeWorkflow1<P1, T>
export function nodeWorkflow<P1, P2, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2 ) => Promise<T> ): NodeWorkflow2<P1, P2, T>
export function nodeWorkflow<P1, P2, P3, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3 ) => Promise<T> ): NodeWorkflow3<P1, P2, P3, T>
export function nodeWorkflow<P1, P2, P3, P4, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4 ) => Promise<T> ): NodeWorkflow4<P1, P2, P3, P4, T>
export function nodeWorkflow<P1, P2, P3, P4, P5, T> ( common: WorkflowCommon, fn: ( p1: P1, p2: P2, p3: P3, p4: P4, p5: P5 ) => Promise<T> ): NodeWorkflow5<P1, P2, P3, P4, P5, T>
export function nodeWorkflow<T> ( common: WorkflowCommon, fn: ( ...args: any[] ) => Promise<T> ): NodeWorkflow<T> {
  const executeWorkflow = ( engine: WorkflowEngine ) => async ( workflowInstanceId: string, ...args: any[] ): Promise<WorkflowResult<T>> => {
    const workflowId = common.id;
    const wf: WorkflowAndInstanceId = { workflowId, instanceId: workflowInstanceId }
    const activityEngine = await workflowEngineToActivityEngine ( engine, wf )
    return {
      workflowId,
      instanceId: workflowInstanceId,
      result: workflowEngineState.run ( engine, () =>
        runWithLoggedActivityEngine ( activityEngine, engine.logging || {}, () => fn ( ...args ) ) )
    }
  };
  const start = async ( ...args: any[] ): Promise<WorkflowResult<T>> => {
    const engine = useWorkflowEngine ()
    return await executeWorkflow ( engine ) ( await engine.nextInstanceId ( common.id ), ...args );
  }
  const complete = ( workflowInstance: string, ...args: any[] ) => {
    const engine = useWorkflowEngine ()
    return executeWorkflow ( engine ) ( workflowInstance, ...args )
  }
  return { complete, start, workflowId: common.id }
}
