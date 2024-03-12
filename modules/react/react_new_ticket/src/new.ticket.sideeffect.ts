import { ISideEffectProcessor, SideEffect } from "@itsmworkbench/react_core";
import { ErrorsAnd, hasErrors, mapErrorsK } from "@laoban/utils";
import { NamedUrl, UrlSaveFn, UrlStoreResult, writeUrl } from "@itsmworkbench/url";
import { Optional, Transform } from "@focuson/lens";
import { Event, SetIdEvent, SetValueEvent } from "@itsmworkbench/events";
import { TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { defaultTicketTypeDetails, detailsToTicketType, TicketTypeDetails } from "@itsmworkbench/tickettype";

//OK Gritting our teeth we aren't worrying about the errors for now. We are just going to assume that everything is going to work.
//This is so that we can test out the happy path of the gui. We want to see what it will look like. We will come back to the errors later.
export interface NewTicketData {
  organisation: string,
  ticketType: TicketTypeDetails
  name: string
  ticket: string
  aiAddedVariables?: TicketVariables
  errors?: string[]
}
export interface AddNewTicketSideEffect extends SideEffect, NewTicketData {
  command: 'addNewTicket';
}

export interface TicketAndTicketEvents {
  ticket: UrlStoreResult
  ticketevents: UrlStoreResult
}
export function addNewTicketSideeffectProcessor<S> ( urlSaveFn: UrlSaveFn, setPage: Optional<S, string>,
                                                     eventL: Optional<S, Event[]>,
                                                     ticketIdL: Optional<S, string>,
                                                     newTicketL: Optional<S, NewTicketData>,
                                                     ticketPath: string ): ISideEffectProcessor<S, AddNewTicketSideEffect, TicketAndTicketEvents> {
  return ({
    accept: ( s: SideEffect ): s is AddNewTicketSideEffect => s.command === 'addNewTicket',
    process: async ( s: S, se: AddNewTicketSideEffect ) => {
      const ticketUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticket', name: se.name }
      const ticketeventsUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticketevents', name: se.name }
      const ticketTypeDetails = se.ticketType || defaultTicketTypeDetails
      const ticketType = detailsToTicketType ( ticketTypeDetails )

      //what we should do instead of this
      //add to the ticket. (should have a flag that says 'error if doing it again')
      //so this is easy so far
      //if error, add to the errors... how do we specify this? Do we have global errors?
      //if not error we want to change the page. How do we do that? How do we say where we want to go? We shouldn't know...we should be told...

      const res: ErrorsAnd<TicketAndTicketEvents> = await mapErrorsK (
        await urlSaveFn ( ticketUrl, { description: se.ticket } ), async ticket => {
          console.log ( 'addNewTicketSideeffectProcessor - ticket ', ticketUrl, ticket )
          const initialTicketEvent: SetIdEvent = {
            event: 'setId', id: ticket.id, path: ticketPath, context: {
              display: { title: 'New Ticket', type: 'ticket', name: se.name },
            }
          }
          const initialVariablesEvent: SetValueEvent = {
            event: 'setValue', path: 'blackboard.ticket', value: se.aiAddedVariables,
            context: { display: { title: 'Ticket Variables', type: 'variables' }, }
          }
          const setTicketTypeEvent: SetValueEvent = {
            event: 'setValue', path: 'blackboard.ticketType', value: { ticketTypeDetails, ticketType },
            context: { display: { title: 'Ticket Type', type: 'ticketType' }, }
          }

          return mapErrorsK ( await urlSaveFn ( ticketeventsUrl, [ setTicketTypeEvent, initialTicketEvent, initialVariablesEvent ] ), async ticketevents => {
            console.log ( 'addNewTicketSideeffectProcessor - ticketevents ', ticketeventsUrl, ticketevents )
            return { ticket, ticketevents }
          } )
        } )
      const txs: Transform<S, any>[] = [
        [ setPage, _ => 'chat' ],
        [ eventL, _ => [] ], //clear all the events. The next line will trigger a reload via polling
        [ ticketIdL, _ => writeUrl ( ticketeventsUrl ) ],
        [ newTicketL, _ => ({ organisation: se.organisation, ticketType: defaultTicketTypeDetails, name: '', ticket: '' }) ]
      ]
      return hasErrors ( res ) ? { result: res } : {
        result: res, txs
      };
    }
  })
}

