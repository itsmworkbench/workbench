import { ISideEffectProcessor, SideEffect, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { ErrorsAnd, hasErrors, mapErrorsK } from "@laoban/utils";
import { NamedUrl, UrlSaveFn, UrlStoreResult, writeUrl } from "@itsmworkbench/url";
import { Optional, Transform } from "@focuson/lens";
import { Event, SetIdEvent, SetValueEvent } from "@itsmworkbench/events";
import { TicketVariables } from "@itsmworkbench/ai_ticketvariables";
import { defaultTicketTypeDetails, detailsToTicketType, TicketTypeDetails } from "@itsmworkbench/tickettype";
import { NewTicketWizardData } from "./wizard/new.ticket.wizard.domain";

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
export interface AddNewTicketSideEffect extends SideEffect, NewTicketWizardData {
  command: 'addNewTicket';
}

export interface TicketAndTicketEvents {
  ticket: UrlStoreResult
  ticketevents: UrlStoreResult
}
export function addNewTicketSideeffectProcessor<S> ( urlSaveFn: UrlSaveFn,
                                                     setPage: Optional<S, TabPhaseAndActionSelectionState>,
                                                     eventL: Optional<S, Event[]>,
                                                     ticketIdL: Optional<S, string>,
                                                     newTicketL: Optional<S, NewTicketWizardData>,
                                                     ticketPath: string,
                                                     variablesPath: string,
                                                     ticketTypePath: string ): ISideEffectProcessor<S, AddNewTicketSideEffect, TicketAndTicketEvents> {
  return ({
    accept: ( s: SideEffect ): s is AddNewTicketSideEffect => s.command === 'addNewTicket',
    process: async ( s: S, se: AddNewTicketSideEffect ) => {
      console.log ( 'addNewTicketSideeffectProcessor - se', se )
      const ticketUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticket', name: se.ticketName }
      const ticketeventsUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticketevents', name: se.ticketName }
      const ticketTypeDetails = se.ticketTypeDetails || defaultTicketTypeDetails
      const ticketType = detailsToTicketType ( ticketTypeDetails )


      //what we should do instead of this
      //add to the ticket. (should have a flag that says 'error if doing it again')
      //so this is easy so far
      //if error, add to the errors... how do we specify this? Do we have global errors?
      //if not error we want to change the page. How do we do that? How do we say where we want to go? We shouldn't know...we should be told...

      const res: ErrorsAnd<TicketAndTicketEvents> = await mapErrorsK (
        await urlSaveFn ( ticketUrl, { description: se.ticketDetails } ), async ticket => {
          console.log ( 'addNewTicketSideeffectProcessor - ticket ', ticketUrl, ticket )

          const initialTicketEvent: SetIdEvent = {
            event: 'setId', id: ticket.id, path: ticketPath, context: {
              display: { title: `New ${ticketTypeDetails.ticketType} Ticket`, type: 'ticket', name: se.ticketName },
              ticketTypeDetails
            }
          }
          const initialVariablesEvent: SetValueEvent = {
            event: 'setValue', path: variablesPath, value: se.aiAddedVariables ||{},
            context: { display: { title: 'Ticket Variables', type: 'variables', hide: true }, }
          }
          const setTicketTypeEvent: SetValueEvent = {
            event: 'setValue', path: ticketTypePath, value: { ticketTypeDetails, ticketType },
            context: { display: { title: 'Ticket Type', type: 'ticketType', hide: true }, }
          }
          console.log('addNewTicketSideeffectProcessor - initialTicketEvent', initialTicketEvent)
          console.log('addNewTicketSideeffectProcessor - setTicketTypeEvent', setTicketTypeEvent)
          console.log('addNewTicketSideeffectProcessor - initialVariablesEvent', initialVariablesEvent)

          return mapErrorsK ( await urlSaveFn ( ticketeventsUrl, [ setTicketTypeEvent, initialTicketEvent, initialVariablesEvent ] ),
            async ticketevents => {
              console.log ( 'addNewTicketSideeffectProcessor - ticketevents ', ticketeventsUrl, ticketevents )
              return { ticket, ticketevents }
            } )
        } )
      const txs: Transform<S, any>[] = [
        [ setPage, _ => ({ workspaceTab: 'chat' }) ],
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

