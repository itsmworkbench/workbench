import { Event, stringToEvents } from "@itsmworkbench/events";
import { nameSpaceDetailsForGit, UrlStoreParser, UrlStoreWriter } from "@itsmworkbench/urlstore";

export type TicketEvents = Event[]


export const ticketEventsParser: UrlStoreParser = ( _: string, s: string ) => stringToEvents ( {}, s )
export const ticketEventWriter: UrlStoreWriter = ( tes: TicketEvents ) => tes.map ( e => `${JSON.stringify ( e )}\n` ).join ( '' )


export function ticketEventsNameSpaceDetails () {
  return nameSpaceDetailsForGit ( 'ticketevents', {
    parser: ticketEventsParser,
    writer: ticketEventWriter,
    extension: 'events.txt'
  } );
}