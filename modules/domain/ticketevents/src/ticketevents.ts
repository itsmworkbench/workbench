import { ParserStoreParser } from "@itsmworkbench/parser";
import { Event, stringToEvents } from "@itsmworkbench/events";
import { nameSpaceDetailsForGit } from "@itsmworkbench/url";

export type TicketEvents = Event[]


export const ticketEventsParser: ParserStoreParser = ( id, s ) => stringToEvents ( {}, s )
export const ticketEventWriter = ( tes: TicketEvents ) => tes.map ( e => `${JSON.stringify ( e )}\n` ).join ( '' )


export function ticketEventsNameSpaceDetails () {
  return nameSpaceDetailsForGit ( 'ticketevents', {
    parser: ticketEventsParser,
    writer: ticketEventWriter,
    extension: 'events.txt'
  } );
}