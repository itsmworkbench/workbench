import { NameAnd } from "@laoban/utils";

export type TicketVariables = NameAnd<string>


type EmailPurpose = 'requestApproval' | 'requestClosure'
export type EmailData={
  purpose: EmailPurpose
  ticketId: string,
  ticket: string
}

export type EmailResult={
  subject: string
  email: string
}
export type AiTicketVariablesFn = ( ticket: string ) => Promise<TicketVariables>

export type AIEmailsFn = ( email: EmailData ) => Promise<EmailResult>
