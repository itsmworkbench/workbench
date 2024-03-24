
//OK Gritting our teeth we aren't worrying about the errors for now. We are just going to assume that everything is going to work.
//This is so that we can test out the happy path of the gui. We want to see what it will look like. We will come back to the errors later.

import { ISideEffectProcessor, SideEffect } from "@itsmworkbench/react_core";
import { NewTicketData } from "./new.ticket.sideeffect";
import { AiTicketVariablesFn, TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { Optional, Transform } from "@focuson/lens";
import { ErrorsAnd } from "@laoban/utils";

export interface AiNewTicketSideEffect extends SideEffect, NewTicketData {
  command: 'aiNewTicket';
}
export function isAiNewTicketSideEffect ( x: any ): x is AiNewTicketSideEffect {
  return x.command === 'aiNewTicket'
}

export function addAiTicketSideeffectProcessor<S> ( ai: AiTicketVariablesFn, variablesL: Optional<S, TicketVariables> ): ISideEffectProcessor<S, AiNewTicketSideEffect, ErrorsAnd<TicketVariables>> {
  return ({
    accept: ( s: SideEffect ): s is AiNewTicketSideEffect => isAiNewTicketSideEffect ( s ),
    process: async ( s: S, se: AiNewTicketSideEffect ) => {
      const ticketVariables = await ai ( se.ticket )
      const txs: Transform<S, any>[] = [
        [ variablesL, _ => ticketVariables ]
      ]
      return { result: ticketVariables, txs }
    }
  })
}

