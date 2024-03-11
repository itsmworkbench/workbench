import { NameAnd } from "@laoban/utils";

export type TicketVariables = NameAnd<string>


export type AiTicketVariablesFn = ( ticket: string ) => Promise<TicketVariables>
