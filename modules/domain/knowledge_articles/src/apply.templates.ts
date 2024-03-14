import { Action } from "@itsmworkbench/actions";
import { derefence, dollarsBracesVarDefn } from "@laoban/variables";

export function deref ( a: Action, s: string, dic: any ) {
  return derefence ( `dereferenceTemplateToActions ${JSON.stringify ( a )}`, dic, s, { variableDefn: dollarsBracesVarDefn, emptyTemplateReturnsSelf: true } )
}
export function dereferenceSqlAction ( a: Action, variables: Record<string, string> ): Action {
  if ( a.by !== 'SQL' ) return a
  return { by: 'SQL', sql: deref ( a, a.sql, variables ) } //explict: the action could have a lot of things in it we don't want to copy
}
export function dereferenceEmailAction ( a: Action, variables: Record<string, string> ): Action {
  if ( a.by !== 'Email' ) return a

  return { by: 'Email', to: deref ( a, a.to, variables ), subject: deref ( a, a.subject, variables ), email: deref ( a, a.email, variables ) }
}
export function dereferenceLdapAction ( a: Action, variables: Record<string, string> ): Action {
  if ( a.by !== 'LDAP' ) return a
  return { by: 'LDAP', who: deref ( a, a.who, variables ) }
}

export function dereferenceReceiveEmailAction ( a: Action, variables: Record<string, string> ): Action {
  return a
}
export function dereferenceAction ( a: Action, variables: any ): Action {
  if ( a === undefined ) return undefined
  if ( a.by === 'SQL' ) return dereferenceSqlAction ( a, variables )
  if ( a.by === 'Email' ) return dereferenceEmailAction ( a, variables )
  if ( a.by === 'LDAP' ) return dereferenceLdapAction ( a, variables )
  if ( a.by === 'ReceiveEmail' ) return dereferenceReceiveEmailAction ( a, variables )
  return a
}

