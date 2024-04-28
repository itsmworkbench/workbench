import { AsyncLocalStorage } from "async_hooks";
import { ActivityEvent, ActivityEvents } from "./activity.events";
import { NameAnd } from "@laoban/utils";

import { LoggingHookState, MetricHookState, runWithMetricsHookState,runWithLoggingHookState } from "@itsmworkbench/kleislis";
import { rememberUpdateCache } from "./replay";

export type WorkflowHookState = {
  workflowId: string
  workflowInstanceId: string
  replayState: ActivityEvents
  currentReplayIndex: number
  updateEventHistory: ( e: ActivityEvent ) => Promise<void>,
}

const workspaceHookState = new AsyncLocalStorage<WorkflowHookState> ()

export function runWithWorkflowHookState<T> ( state: WorkflowHookState, fn: () => T ): T {
  return workspaceHookState.run ( state, fn )
}

export function runWithWorkflowLogsAndMetrics<T> ( state: WorkflowHookState, metrics: MetricHookState, log: LoggingHookState, fn: () => Promise<T> ): Promise<T> {
  return workspaceHookState.run ( state, () => {
    return runWithMetricsHookState ( metrics, () => {
      return runWithLoggingHookState ( log, fn )
    } )
  } )

}
export function useWorkflowHookState (): WorkflowHookState {
  let store = workspaceHookState.getStore ();
  if ( store === undefined ) throw new Error ( 'Software error: workflow hook state not set' )
  return store
}

export function workflowHookStateForTest ( store: ActivityEvent[], metrics: NameAnd<number> ): WorkflowHookState {
  const state: WorkflowHookState = {
    workflowId: '1',
    workflowInstanceId: '2',
    replayState: [], //nothing to replay
    currentReplayIndex: 0,
    updateEventHistory: rememberUpdateCache ( store )
  }
  return state;
}

