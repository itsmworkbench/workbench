import { approvalTT, checkUsersTT, installSoftwareTT, simpleTicketType, KnowledgeArticle, updateSqlTT, usingKATT, usingTicketTypeTT } from "./knowledgeArticle";
import { deepCombineTwoObjects } from "@laoban/utils";

export type ApprovalState = 'Pre Approved' | 'Needs Approval' | 'No Approval Needed';
export type TicketTypeName = 'General' | 'Update Database' | 'Install Software';
export type ValidateInvolvedParties = boolean;

export interface KnowledgeArticleDetails {
  ticketType: TicketTypeName;
  approvalState: ApprovalState;
  validateInvolvedParties: ValidateInvolvedParties;
  usingKnowledgeArticle?: string
}
export const defaultKnowledgeArticleDetails: KnowledgeArticleDetails = {
  ticketType: 'General',
  approvalState: 'Needs Approval',
  validateInvolvedParties: false,

}

export function detailsToKnowledgeArticle (details: KnowledgeArticleDetails ): KnowledgeArticle {
  const acc: KnowledgeArticle[] = [ simpleTicketType ]
  acc.push ( details.usingKnowledgeArticle ? usingKATT : usingTicketTypeTT )
  if ( details.ticketType === 'Update Database' ) acc.push ( updateSqlTT )
  if ( details.ticketType === 'Install Software' ) acc.push ( installSoftwareTT )
  if ( details.approvalState === 'Needs Approval' ) acc.push ( approvalTT )
  if ( details.validateInvolvedParties ) acc.push ( checkUsersTT )
  let raw = acc.reduce<KnowledgeArticle> ( deepCombineTwoObjects, {} as KnowledgeArticle );
  return { ...raw, capabilities: [ ...new Set ( raw.capabilities ) ].sort () }
}