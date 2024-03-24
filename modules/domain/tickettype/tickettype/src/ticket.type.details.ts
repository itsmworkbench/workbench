import { approvalTT, checkUsersTT, installSoftwareTT, simpleTicketType, TicketType, updateSqlTT, usingKATT, usingTicketTypeTT } from "./ticket.type";
import { deepCombineTwoObjects } from "@laoban/utils";

export type ApprovalState = 'Pre Approved' | 'Needs Approval' | 'No Approval Needed';
export type TicketTypeName = 'General' | 'Update Database' | 'Install Software';
export type ValidateInvolvedParties = boolean;

export interface TicketTypeDetails {
  ticketType: TicketTypeName;
  approvalState: ApprovalState;
  validateInvolvedParties: ValidateInvolvedParties;
  usingKnowledgeArticle?: string
}
export const defaultTicketTypeDetails: TicketTypeDetails = {
  ticketType: 'General',
  approvalState: 'Needs Approval',
  validateInvolvedParties: false,

}

export function detailsToTicketType ( details: TicketTypeDetails ): TicketType {
  const acc: TicketType[] = [ simpleTicketType ]
  acc.push ( details.usingKnowledgeArticle ? usingKATT : usingTicketTypeTT )
  if ( details.ticketType === 'Update Database' ) acc.push ( updateSqlTT )
  if ( details.ticketType === 'Install Software' ) acc.push ( installSoftwareTT )
  if ( details.approvalState === 'Needs Approval' ) acc.push ( approvalTT )
  if ( details.validateInvolvedParties ) acc.push ( checkUsersTT )
  let raw = acc.reduce<TicketType> ( deepCombineTwoObjects, {} as TicketType );
  return { ...raw, capabilities: [ ...new Set ( raw.capabilities ) ].sort () }
}