import { Event } from "@itsmworkbench/events";
import { Capability, EmailWorkBenchContext, isEmailWorkBenchContext, isLdapWorkBenchContext, isReceiveEmailWorkbenchContext, isSqlWorkBenchContext, isWorkBenchContext, LdapWorkBenchContext, ReceiveEmailWorkbenchContext, SqlWorkBenchContext, WhereContext, WorkBenchContext } from "@itsmworkbench/domain";
import { TicketType } from "@itsmworkbench/tickettype";
import { NameAnd } from "@laoban/utils";
import { Action } from "@itsmworkbench/actions";

export type EventWithWorkBenchContext<T> = Event & { context: WorkBenchContext<T> }


export function updateSqlAction ( a: Action, c: SqlWorkBenchContext ): Action {
  if ( a.by !== 'SQL' ) return a
  return { ...a, sql: c.data.sql }
}
export function updateEmailAction ( a: Action, c: EmailWorkBenchContext ): Action {
  if ( a.by !== 'Email' ) return a
  return { ...a, to: c.data.to, subject: c.data.subject, email: c.data.email }
}
export function updateLdapAction ( a: Action, c: LdapWorkBenchContext ): Action {
  if ( a.by !== 'LDAP' ) return a
  return { ...a, who: c.data.email }
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
export function makeKnowledgeArticle ( e: Event[] ) {
  const withTicketType: any[] = e.filter ( ( e: any ) => e.value?.ticketType )
  if ( withTicketType.length === 0 ) return [ 'Could not find ticket type event' ]
  const foundTicketType: TicketType = withTicketType[ withTicketType.length - 1 ].value.ticketType
  const ticketType: TicketType = JSON.parse ( JSON.stringify ( foundTicketType ) )
  const capabilities: Capability[] = []
  const workBenchEvents = e.filter ( e => isWorkBenchContext ( e.context ) ) as EventWithWorkBenchContext<any>[]
  for ( const event of workBenchEvents ) {
    capabilities.push ( event.context.capability )
    const actions: NameAnd<Action> = ticketType.actions[ event.context.where.phase ] || {}
    const action: Action = actions[ event.context.where.action ]
    actions[ event.context.where.action ] = updateAction ( event, action )
  }
  return { capabilities:[...new Set(capabilities)].sort(), actions: ticketType.actions }
}

