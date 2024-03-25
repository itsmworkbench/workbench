import { EnrichedEvent, Event } from "@itsmworkbench/events";
import { Capability, EmailWorkBenchContext, isEmailWorkBenchContext, isLdapWorkBenchContext, isReceiveEmailWorkbenchContext, isReviewTicketWorkBenchContext, isSqlWorkBenchContext, isWorkBenchContext, LdapWorkBenchContext, ReceiveEmailWorkbenchContext, ReviewTicketWorkBenchContext, SqlWorkBenchContext, WorkBenchContext } from "@itsmworkbench/domain";
import { TicketType } from "@itsmworkbench/tickettype";
import { ErrorsAnd, NameAnd } from "@laoban/utils";

import { findUsedVariables, reverseTemplate } from "@itsmworkbench/utils";
import { Action, isBaseAction } from "@itsmworkbench/actions";

export type EventWithWorkBenchContext<T> = Event & { context: WorkBenchContext<T> }


export const allWorkbenchEvents = ( e: Event[] ) =>
  (e.filter ( e => isWorkBenchContext ( e.context ) ) as EventWithWorkBenchContext<any>[]);
export function findWorkbenchEventFor ( e: Event[], phase: string, action: string ): EventWithWorkBenchContext<any> | undefined {
  const found = e.filter ( e => isWorkBenchContext ( e.context ) && e.context.where.phase === phase && e.context.where.action === action ) as EventWithWorkBenchContext<any>[]
  return found.length === 0 ? undefined : found[ found.length - 1 ]
}

export function findActionsInEventsMergeWithTicketType ( ticketType: TicketType, e: Event[], phase: string, action: string ) {
  const found = ticketType?.actions?.[ phase ]?.[ action ] || {}
  // console.log ( 'findActionsInEventsMergeWithTicketType - found', phase, action, found )
  const workBenchEvent: EventWithWorkBenchContext<any> = findWorkbenchEventFor ( e, phase, action )
  // console.log ( 'findActionsInEventsMergeWithTicketType - workBenchEvent', workBenchEvent )
  if ( workBenchEvent ) {
    const result = { ...found, by: workBenchEvent.context.capability, ...workBenchEvent.context.data } as Action
    return result
  }
  return found
}
export function findActionInEventsFor ( e: EnrichedEvent<any, any>[], phase: string, action: string ): Action {
  const ticketType: TicketType = lastTicketType ( e )
  // console.log ( 'findActionInEventsFor - ticketType', ticketType )
  return findActionsInEventsMergeWithTicketType ( ticketType, e, phase, action )
}

export function lastTicketType ( e: EnrichedEvent<any, any>[] ): TicketType {
  const withTicketType: any[] = e.filter ( ( e: any ) => e.value?.ticketType || e.context?.data?.ticketType !== undefined )
  if ( withTicketType.length === 0 ) return undefined
  let foundEvent = withTicketType[ withTicketType.length - 1 ];
  const foundTicketType: TicketType = foundEvent.value.ticketType || foundEvent.context.data.ticketType
  return JSON.parse ( JSON.stringify ( foundTicketType ) )

}

export function createVariablesUsedFrom ( e: Event[], variables: Record<string, string> ): string[] {
  const ticketType: TicketType = lastTicketType ( e )
  if ( ticketType == undefined ) return []
  const result: string[] = []
  const workBenchEvents = allWorkbenchEvents ( e );
  for ( const event of workBenchEvents ) {
    const action = findActionsInEventsMergeWithTicketType ( ticketType, e, event.context.where.phase, event.context.where.action )
    if ( isBaseAction ( action ) ) {
      const usedVariables = findUsedVariables ( JSON.stringify ( action ), variables )
      result.push ( ...usedVariables )
    }
  }
  return result;
}

export function basics ( a: Action ): NameAnd<any> {
  return { safe: a.safe, waitingFor: a.waitingFor, hint: a.hint, optional: a.optional }

}

export function reverseSqlAction ( variables: Record<string, string>, a: Action, c: SqlWorkBenchContext ): Action {
  if ( a.by !== 'SQL' ) return a
  let sql = reverseTemplate ( c.data.sql, variables );
  let env = reverseTemplate ( c.data.env, variables );
  console.log ( 'reverseSqlAction - sql', sql )
  return { ...basics ( a ), by: "SQL", sql, env } //explict: the action could have a lot of things in it we don't want to copy
}
export function reverseEmailAction ( variables: Record<string, string>, a: Action, c: EmailWorkBenchContext ): Action {
  if ( a.by !== 'Email' ) return a
  return {
    ...basics ( a ),
    by: 'Email',
    to: reverseTemplate ( c.data.to, variables ),
    subject: reverseTemplate ( a.highlyVariant ? undefined : c.data.subject, variables ),
    email: reverseTemplate ( a.highlyVariant ? undefined : c.data.email, variables )
  }
}
export function reverseLdapAction ( variables: Record<string, string>, a: Action, c: LdapWorkBenchContext ): Action {
  console.log('reverseLdapAction - action',a)
  console.log('reverseLdapAction - context',c)
  if ( a.by !== 'LDAP' ) return a
  let who = reverseTemplate ( c.data.who, variables );
  console.log('reverseLdapAction - who', who, c.data.who, variables)
  return {
    ...basics ( a ),
    by: 'LDAP',
    who
  }
}

export function reverseReviewTicketAction ( variables: Record<string, string>, a: Action, c: ReviewTicketWorkBenchContext ): Action {
  return {
    ...basics ( a ),
    by: 'ReviewTicket',
  }
}
export function reverseReceiveEmailAction ( variables: Record<string, string>, a: Action, c: ReceiveEmailWorkbenchContext ): Action {
  return a
}
export function reverseAction ( variables: Record<string, string>, e: EventWithWorkBenchContext<any>, a: Action ): Action {
  console.log ( 'reverseAction', a, e.context )
  if ( isSqlWorkBenchContext ( e.context ) ) return reverseSqlAction ( variables, a, e.context )
  if ( isEmailWorkBenchContext ( e.context ) ) return reverseEmailAction ( variables, a, e.context )
  if ( isLdapWorkBenchContext ( e.context ) ) return reverseLdapAction ( variables, a, e.context )
  if ( isReceiveEmailWorkbenchContext ( e.context ) ) return reverseReceiveEmailAction ( variables, a, e.context )
  if ( isReviewTicketWorkBenchContext ( e.context ) ) return reverseReviewTicketAction ( variables, a, e.context )
  return a
}


export function makeKnowledgeArticle ( e: Event[], ticketType: TicketType, variables: Record<string, string> ): ErrorsAnd<TicketType> {
  if ( ticketType == undefined ) return [ 'Could not find ticket type event' ]
  const copy = JSON.parse ( JSON.stringify ( ticketType ) )
  const capabilities: Capability[] = []
  const workBenchEvents = allWorkbenchEvents ( e );
  for ( const event of workBenchEvents ) {
    capabilities.push ( event.context.capability )
    const action = findActionsInEventsMergeWithTicketType ( copy, e, event.context.where.phase, event.context.where.action )
    const actions: NameAnd<Action> = copy.actions[ event.context.where.phase ] || {}
    actions[ event.context.where.action ] = reverseAction ( variables, event, action )
    copy.actions[ event.context.where.phase ] = actions
  }
  const variablesUsed = createVariablesUsedFrom ( e, variables )
  // console.log ( 'variablesUsed', variablesUsed )
  console.log ( 'copy.actions', copy?.actions )
  return { variables: [ ...new Set ( variablesUsed ) ].sort (), capabilities: [ ...new Set ( capabilities ) ].sort (), actions: copy.actions } as any
}

