import { BaseSideeffect, EventSideEffect, ISideEffectProcessor } from "@itsmworkbench/react_core";
import { ErrorsAnd } from "@laoban/utils";
import { SendEvents } from "@itsmworkbench/apiclienteventstore";

export interface NewTicketData {
  name: string
  description: string
  errors?: string[]
}
export interface AddNewTicketSideEffect extends BaseSideeffect {
  command: 'addNewTicket';
  ticket: NewTicketData;
}

export function addNewTicketSideeffect<S> (): ISideEffectProcessor<S, AddNewTicketSideEffect, boolean> {
  return ({
    accept: ( s: BaseSideeffect ): s is AddNewTicketSideEffect => s.command === 'addNewTicket',
    process: async ( s, se ) => {
      console.log ( 'addNewTicketSideeffect', s )
      return true
    }
  });
}
