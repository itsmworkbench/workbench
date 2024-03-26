import { NameAnd } from "@laoban/utils";

export type EmailPurpose = 'requestApproval' | 'requestClosure' | 'requestMoreData'
export type EmailData = {
  purpose: EmailPurpose
  ticketId: string,
  ticket: string
}
export function isEmailData ( t: any ): t is EmailData {
  return t?.ticketId && t?.ticket && t?.purpose && [ 'requestApproval', 'requestClosure', 'requestMoreData' ].includes ( t.purpose )
}
export type EmailDataWithMissingData = EmailData & { missingData: string[] }
export function isEmailDataWithMissingData ( t: any ): t is EmailDataWithMissingData {
  return t?.missingData && isEmailData ( t )
}
export type EmailPurposeAnd<T> = {
  requestApproval: T
  requestClosure: T
  requestMoreData: T
}


export type EmailPurposeFn = EmailPurposeAnd<AIEmailsFn>
function processEmailFn ( fns: EmailPurposeAnd<AIEmailsFn> ): AIEmailsFn {
  return async ( email: EmailData ) => {
    let fn = fns[ email.purpose ];
    if ( !fn ) throw new Error ( `No function for email purpose ${email.purpose}` )
    return fn ( email )
  }
}

export type EmailStringFn = ( email: EmailData ) => Promise<string>
export function processEmailsThatReturnAstring ( fns: EmailPurposeAnd<EmailStringFn>, fn: ( res: string ) => EmailResult ): AIEmailsFn {
  return async ( email: EmailData ) => {
    let emailFn = fns[ email.purpose ];
    if ( !emailFn ) throw new Error ( `No function for email purpose ${email.purpose}` )
    return emailFn ( email ).then ( fn )
  }
}


export type EmailResult = {
  subject?: string
  email?: string
  error?: NameAnd<string>
}
export type AIEmailsFn = ( email: EmailData ) => Promise<EmailResult>
