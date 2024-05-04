import { IncMetric, invalid, ReplayEvent, ReplayEventProcessorFn, validateActivityId } from "@itsmworkbench/kleislis";
import { chainOfResponsibility, PartialFunction } from "@itsmworkbench/utils";
import { NameAnd } from "@laoban/utils";
import { Workflow, WorkflowEngine } from "./workflow";


export type WorkflowEvent = ReplayEvent & {
  id: string // the workflow id (which is the same as the activity id as in this context the workflow is an activity)
  instanceId: string // the instance id of the workflow
}
export function isWorkflowEvent ( e: any ): e is WorkflowEvent {
  return e?.id !== undefined && e.instanceId !== undefined
}

export function processWorkflowEvent<E> ( incMetric: IncMetric, engine: WorkflowEngine, registeredWorkflows: NameAnd<Workflow<any>> ): PartialFunction<E, Promise<any>> {
  return {
    isDefinedAt: isWorkflowEvent,
    apply: ( e: any ): Promise<any> => {
      const event = e as WorkflowEvent
      if ( incMetric ) incMetric ( 'activity.replay.workflowEvent' )
      const workflow = registeredWorkflows[ event.id ]
      if ( !workflow ) throw new Error ( `Workflow ${event.id} not found` )

      return workflow.complete ( engine, event.instanceId )
    }
  }
}

export const workflowReplyEventProcessor = ( engine: WorkflowEngine, registeredWorkflows: NameAnd<Workflow<any>> | undefined ): ReplayEventProcessorFn => incMetric => {
  const chain = chainOfResponsibility ( invalid ( incMetric ),
    processWorkflowEvent ( incMetric, engine, registeredWorkflows || {} )
  );
  return ( activityId, e ): Promise<any> => {
    validateActivityId ( e, activityId, incMetric );
    return chain ( e )
  }
};
