import { NameAnd } from "@laoban/utils";

export type TicketVariables = NameAnd<string|number>

export type AiTicketVariablesFn = ( ticket: string ) => Promise<TicketVariables>


export type AIKnownTicketVariablesFn = ( ticket: string, attributes: string[] ) => Promise<TicketVariables>
