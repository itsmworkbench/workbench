import { ISideEffectProcessor, SideEffect } from "@itsmworkbench/react_core";
import { ErrorsAnd, mapErrors, mapErrorsK } from "@laoban/utils";
import { UrlSaveFn, UrlStoreResult, writeUrl } from "@itsmworkbench/url";

//OK Gritting our teeth we aren't worrying about the errors for now. We are just going to assume that everything is going to work.
//This is so that we can test out the happy path of the gui. We want to see what it will look like. We will come back to the errors later.
export interface NewTicketData {
  organisation: string,
  name: string
  ticket: string
  errors?: string[]
}
export interface AddNewTicketSideEffect extends SideEffect, NewTicketData {
  command: 'addNewTicket';
}

export interface TicketAndTicketEvents {
  ticket: UrlStoreResult
  ticketevents: UrlStoreResult
}
export function addNewTicketSideeffectProcessor<S> ( urlSaveFn: UrlSaveFn ): ISideEffectProcessor<AddNewTicketSideEffect, ErrorsAnd<TicketAndTicketEvents>> {
  return ({
    accept: ( s: SideEffect ): s is AddNewTicketSideEffect => s.command === 'addNewTicket',
    process: async ( se: AddNewTicketSideEffect ) => {
      const ticketUrl = writeUrl ( { scheme: 'itsm', organisation: se.organisation, namespace: 'ticket', name: se.name } )
      const ticketeventsUrl = writeUrl ( { scheme: 'itsm', organisation: se.organisation, namespace: 'ticketevents', name: se.name } )

      //what we should do instead of this
      //add to the ticket. (should have a flag that says 'error if doing it again')
      //so this is easy so far
      //if error, add to the errors... how do we specify this? Do we have global errors?
      //if not error we want to change the page. How do we do that? How do we say where we want to go? We shouldn't know...we should be told...

      return mapErrorsK ( await urlSaveFn ( ticketUrl, { description: se.ticket } ), async ticket => {
        console.log ( 'addNewTicketSideeffectProcessor - ticket ', ticketUrl, ticket )
        return mapErrorsK ( await urlSaveFn ( ticketeventsUrl, [] ), async ticketevents => {
          console.log ( 'addNewTicketSideeffectProcessor - ticketevents ', ticketeventsUrl, ticketevents )
          return { ticket, ticketevents }
        } )
      } )
    }
  })
}
