import React from "react";
import { ISideEffectProcessor, SideEffect, TabPhaseAndActionSelectionState } from "@itsmworkbench/react_core";
import { ErrorsAnd, hasErrors, mapErrorsK } from "@laoban/utils";
import { ListNamesResult, NamedUrl, UrlSaveFn, UrlStoreResult, writeUrl } from "@itsmworkbench/urlstore";
import { Optional, Transform } from "@focuson/lens";
import { Event, SetIdEvent, SetValueEvent } from "@itsmworkbench/events";
import { TicketVariables } from "@itsmworkbench/ai";
import { defaultTicketTypeDetails, detailsToTicketType, TicketTypeDetails } from "@itsmworkbench/tickettype";
import { NewTicketWizardData } from "./new.ticket.wizard.domain";


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
                                                     ticketL: Optional<S,any>,
                                                     ticketIdL: Optional<S, string>,
                                                     newTicketL: Optional<S, NewTicketWizardData>,
                                                     tickListO: Optional<S, ListNamesResult>,
                                                     ticketPath: string,
                                                     ticketTypePath: string ): ISideEffectProcessor<S, AddNewTicketSideEffect, TicketAndTicketEvents> {
  return ({
    accept: ( s: SideEffect ): s is AddNewTicketSideEffect => s.command === 'addNewTicket',
    process: async ( s: S, se: AddNewTicketSideEffect ) => {
      console.log ( 'addNewTicketSideeffectProcessor - se', se )
      const ticketUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticket', name: se.ticketName }
      const ticketeventsUrl: NamedUrl = { scheme: 'itsm', organisation: se.organisation, namespace: 'ticketevents', name: se.ticketName }
      const ticketTypeDetails = se.ticketTypeDetails || defaultTicketTypeDetails
      const ticketType = se.ticketType ?? detailsToTicketType ( ticketTypeDetails )


      //what we should do instead of this
      //add to the ticket. (should have a flag that says 'error if doing it again')
      //so this is easy so far
      //if error, add to the errors... how do we specify this? Do we have global errors?
      //if not error we want to change the page. How do we do that? How do we say where we want to go? We shouldn't know...we should be told...

      const res: ErrorsAnd<TicketAndTicketEvents> = await mapErrorsK (
        await urlSaveFn ( ticketUrl, {
          description: se.ticketDetails,
          attributes: {
            ticketName: se.ticketName,
            issuer: se.issuer
          }
        } ), async ticket => {
            console.log ( 'addNewTicketSideeffectProcessor - ticket ', ticketUrl, ticket )

          const initialTicketEvent: SetIdEvent = {
            event: 'setId', id: ticket.id, path: ticketPath, context: {
              display: { title: `New ${ticketTypeDetails.ticketType} Ticket`, type: 'ticket', name: se.ticketName },
              ticketTypeDetails
            }
          }
          // const initialVariablesEvent: SetValueEvent = {
          //   event: 'setValue', path: variablesPath, value: se.aiAddedVariables ||{},
          //   context: { display: { title: 'Ticket Variables', type: 'variables', hide: true }, }
          // }
          const setTicketTypeEvent: SetValueEvent = {
            event: 'setValue', path: ticketTypePath, value: { ticketTypeDetails, ticketType },
            context: { display: { title: 'Ticket Type', type: 'ticketType', hide: true }, }
          }
          console.log ( 'addNewTicketSideeffectProcessor - initialTicketEvent', initialTicketEvent )
          console.log ( 'addNewTicketSideeffectProcessor - setTicketTypeEvent', setTicketTypeEvent )
          // console.log('addNewTicketSideeffectProcessor - initialVariablesEvent', initialVariablesEvent)

          return mapErrorsK ( await urlSaveFn ( ticketeventsUrl, [ setTicketTypeEvent, initialTicketEvent ] ),
            async ticketevents => {
              console.log ( 'addNewTicketSideeffectProcessor - ticketevents ', ticketeventsUrl, ticketevents )
              return { ticket, ticketevents }
            } )
        } )
      const txs: Transform<S, any>[] = [
        [ setPage, _ => ({ workspaceTab: 'chat' }) ],
        [ ticketL, _ => {} ], //clear all the ticket data
        [ ticketIdL, _ => writeUrl ( ticketeventsUrl ) ],
        [ tickListO, _ => undefined ],
        [ newTicketL, _ => ({ organisation: se.organisation, ticketType: defaultTicketTypeDetails, name: '', ticket: '' }) ]
      ]
      return hasErrors ( res ) ? { result: res } : {
        result: res, txs
      };
    }
  })
}

