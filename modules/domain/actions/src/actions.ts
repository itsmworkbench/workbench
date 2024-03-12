import { Capability } from "@itsmworkbench/domain";


export interface BaseAction {
  by: Capability
  safe?: boolean
  waitingFor?: string[]
  hint?: string
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


export type Action = SqlAction | LdapAction | EmailAction | ChatAction | ManualAction | ReceiveEmailAction | TicketAction
export interface SafeAction extends BaseAction {
  safe?: true
}
export function isSafeAction ( x: any ): x is SafeAction {
  return x.safe === true
}

