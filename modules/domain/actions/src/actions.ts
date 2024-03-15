import { Capability, PhaseAnd } from "@itsmworkbench/domain";
import { NameAnd } from "@laoban/utils";


export interface BaseAction {
  by: Capability
  safe?: boolean
  waitingFor?: string[]
  hint?: string
  optional?: boolean
}
export function isBaseAction ( a: any ) {
  if ( a === undefined || a === null ) return false
  return a.by !== undefined
}
export interface SqlAction extends BaseAction {
  by: 'SQL'
  sql?: string

}
export interface LdapAction extends BaseAction {
  by: 'LDAP'
  who: string
}

export interface EmailAction extends BaseAction {
  by: 'Email'
  to: string
  subject?: string
  email?: string
  highlyVariant?: boolean
}
export interface ReceiveEmailAction extends BaseAction {
  by: 'ReceiveEmail'
  from: string
}
export interface ChatAction extends BaseAction {
  by: 'Chat'
  to: string
}
export interface ManualAction extends BaseAction {
  by: 'Manual'
}
export interface TicketAction extends BaseAction {
  by: 'Ticket'
}

export interface KnowledgeArticleAction extends BaseAction {
  by: 'KnowledgeArticle'

}

export interface ReviewTicketAction extends BaseAction {
  by: 'ReviewTicket'
}

export type Action = SqlAction | LdapAction | EmailAction |
  ChatAction | ManualAction | ReceiveEmailAction | TicketAction | KnowledgeArticleAction |
  ReviewTicketAction
export interface SafeAction extends BaseAction {
  safe?: true
}
export function isSafeAction ( x: any ): x is SafeAction {
  return x.safe === true
}

export const phaseStatus = ( actions: PhaseAnd<NameAnd<Action>>, status: PhaseAnd<NameAnd<boolean>> ) => ( phase: string ) => {
  const phaseActions = actions[ phase ] || {} as any
  const phaseStatus = status[ phase ]
  let result: boolean = true;
  if ( Object.keys ( phaseActions ).length === 0 ) return true;
  for ( const action in phaseActions ) {
    if ( phaseStatus?.[ action ] === false ) return false
    result = result && phaseStatus?.[ action ]
  }
  return result;

};
