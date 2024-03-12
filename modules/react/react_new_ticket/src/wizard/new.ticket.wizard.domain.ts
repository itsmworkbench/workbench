import { TicketTypeDetails } from "@itsmworkbench/tickettype";
import { LensState } from "@focuson/state";

export type NewTicketWizardData = {
  currentStep: NewTicketWizardStep
  whereIsTicket: TicketSourceMethod
  ticketName: string
  ticketDetails: string
  ticketTypeDetails: TicketTypeDetails
}

export type NewTicketWizardStep = 'whereIsTicket' | 'createTicket' | 'howToProcessTicket'
export type NewTicketWizardStepAnd<T> = {
  whereIsTicket: T
  createTicket: T
  howToProcessTicket: T
}
export const newTicketWizardSteps: NewTicketWizardStep[] = [ 'whereIsTicket', 'createTicket', 'howToProcessTicket' ]
export const firstNewTicketWizardStep: NewTicketWizardStep = 'whereIsTicket'

export type TicketSourceMethod = 'manually' | 'fromAzureDevOps' | 'fromJira' | 'fromServiceNow';
export type TicketSourceAnd<T> = {
  manually: T
  fromAzureDevOps: T
  fromJira: T
  fromServiceNow: T
}
export const ticketSourceMethods: TicketSourceMethod[] = [ 'manually', 'fromAzureDevOps', 'fromJira', 'fromServiceNow' ]

export function isSameOrBefore ( currentStep: NewTicketWizardStep, targetStep: NewTicketWizardStep ): boolean {
  const currentStepIndex = newTicketWizardSteps.indexOf ( currentStep );
  const targetStepIndex = newTicketWizardSteps.indexOf ( targetStep );
  return targetStepIndex <= currentStepIndex;
}
export function getNextWizardStep ( currentStep: NewTicketWizardStep ): NewTicketWizardStep | undefined {
  const currentIndex = newTicketWizardSteps.indexOf ( currentStep );
  const nextIndex = currentIndex + 1;
  return newTicketWizardSteps[ nextIndex ];
}
export function getPreviousWizardStep ( currentStep: NewTicketWizardStep ): NewTicketWizardStep | undefined {
  const currentIndex = newTicketWizardSteps.indexOf ( currentStep );
  const previousIndex = currentIndex - 1;
  return newTicketWizardSteps[ previousIndex ];
}
export function getCurrentStep<S> ( state: LensState<S, NewTicketWizardStep, any> ) {
  return state.optJson () || firstNewTicketWizardStep;
}
