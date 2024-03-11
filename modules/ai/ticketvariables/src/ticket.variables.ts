import { NameAnd } from "@laoban/utils";

type TicketVariables = NameAnd<string>


export type AiTicketVariablesFn = ( ticket: string ) => Promise<TicketVariables>
