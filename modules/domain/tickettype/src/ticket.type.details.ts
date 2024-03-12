export type ApprovalState = 'Pre Approved' | 'Needs Approval' | 'No Approval Needed';
export type TicketTypeName = 'General' | 'Update Database';
export type ValidateInvolvedParties = boolean;

export interface TicketTypeDetails {
  ticketType: TicketTypeName;
  approvalState: ApprovalState;
  validateInvolvedParties: ValidateInvolvedParties;
}
export const defaultTicketTypeDetails: TicketTypeDetails = {
  ticketType: 'General',
  approvalState: 'No Approval Needed',
  validateInvolvedParties: false,
}
