import { Event } from "@itsmworkbench/events";
import { Capability, EmailWorkBenchContext, isEmailWorkBenchContext, isLdapWorkBenchContext, isReceiveEmailWorkbenchContext, isSqlWorkBenchContext, isWorkBenchContext, LdapWorkBenchContext, ReceiveEmailWorkbenchContext, SqlWorkBenchContext, WorkBenchContext } from "@itsmworkbench/domain";
import { TicketType } from "@itsmworkbench/tickettype";
import { NameAnd } from "@laoban/utils";
import { Action, BaseAction, SqlAction } from "@itsmworkbench/actions";

export type EventWithWorkBenchContext<T> = Event & { context: WorkBenchContext<T> }


export function updateSqlAction ( a: Action, c: SqlWorkBenchContext ): Action {
  if ( a.by !== 'SQL' ) return a
  return { by: 'SQL', sql: c.data.sql } //explict: the action could have a lot of things in it we don't want to copy
}
export function updateEmailAction ( a: Action, c: EmailWorkBenchContext ): Action {
  if ( a.by !== 'Email' ) return a
  return { by: 'Email', to: c.data.to, subject: c.data.subject, email: c.data.email }
}
export function updateLdapAction ( a: Action, c: LdapWorkBenchContext ): Action {
  if ( a.by !== 'LDAP' ) return a
  return { by: 'LDAP', who: c.data.email }
}

export function updateReceiveEmailAction ( a: Action, c: ReceiveEmailWorkbenchContext ): Action {
  return a
}
export function updateAction ( e: EventWithWorkBenchContext<any>, a: Action ): Action {
  if ( isSqlWorkBenchContext ( e.context ) ) return updateSqlAction ( a, e.context )
  if ( isEmailWorkBenchContext ( e.context ) ) return updateEmailAction ( a, e.context )
  if ( isLdapWorkBenchContext ( e.context ) ) return updateLdapAction ( a, e.context )
  if ( isReceiveEmailWorkbenchContext ( e.context ) ) return updateReceiveEmailAction ( a, e.context )
  return a
}
export const allWorkbenchEvents = ( e: Event[] ) =>
  (e.filter ( e => isWorkBenchContext ( e.context ) ) as EventWithWorkBenchContext<any>[]);
export function findWorkbenchEventFor ( e: Event[], phase: string, action: string ): EventWithWorkBenchContext<any> | undefined {
  return e.find ( e => isWorkBenchContext ( e.context ) && e.context.where.phase === phase && e.context.where.action === action ) as EventWithWorkBenchContext<any>
}

export function findActionsInEventsMergeWithTicketType ( ticketType: TicketType, e: Event[], phase: string, action: string ) {
  const found = ticketType.actions?.[ phase ]?.[ action ] || {}
  const workBenchEvent: EventWithWorkBenchContext<any> = findWorkbenchEventFor ( e, phase, action )
  if ( workBenchEvent ) {
    const result = { ...found, by: workBenchEvent.context.capability, ...workBenchEvent.context.data } as Action
    return result
  }
  return found
}
export function findActionInEventsFor ( e: Event[], phase: string, action: string ): Action {
  const ticketType: TicketType = lastTicketType ( e )
  return findActionsInEventsMergeWithTicketType ( ticketType, e, phase, action )
}

export function lastTicketType ( e: Event[] ): TicketType {
  const withTicketType: any[] = e.filter ( ( e: any ) => e.value?.ticketType )
  if ( withTicketType.length === 0 ) return undefined
  const foundTicketType: TicketType = withTicketType[ withTicketType.length - 1 ].value.ticketType
  return JSON.parse ( JSON.stringify ( foundTicketType ) )

}
export function makeKnowledgeArticle ( e: Event[] ) {
  const ticketType: TicketType = lastTicketType ( e )
  if ( ticketType == undefined ) return [ 'Could not find ticket type event' ]
  const capabilities: Capability[] = []
  const workBenchEvents = allWorkbenchEvents ( e );
  for ( const event of workBenchEvents ) {
    capabilities.push ( event.context.capability )
    const action = findActionsInEventsMergeWithTicketType ( ticketType, e, event.context.where.phase, event.context.where.action )
    const actions: NameAnd<Action> = ticketType.actions[ event.context.where.phase ] || {}
    actions[ event.context.where.action ] = updateAction ( event, action )
    ticketType.actions[ event.context.where.phase ] = actions
  }
  return { capabilities: [ ...new Set ( capabilities ) ].sort (), actions: ticketType.actions }
}

