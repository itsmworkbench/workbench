import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { addVariables, extractVariablesFromMarkdown, Variables } from "@itsmworkbench/variables";
import { nameSpaceDetailsForGit, UrlStoreParser, UrlStoreWriter } from "@itsmworkbench/urlstore";

export interface Ticket {
  id: string
  attributes: NameAnd<any>
  description: string
}


export function variablesFromTicket ( sofar: NameAnd<any>, t: Ticket ): ErrorsAnd<Variables> {
  return addVariables ( extractVariablesFromMarkdown ( t.description ), { id: t.id } )
}

export const ticketParser: UrlStoreParser = async( id, s ) => {
  const index = s.indexOf ( '\n---\n' )
  if ( index === -1 ) return { attributes: {}, description: s }
  return { attributes: JSON.parse ( s.substring ( 0, index ).trim () ), description: s.substring ( index + 5 ) }
}
export const ticketWriter: UrlStoreWriter = ( ticket: Ticket ) => `${JSON.stringify ( ticket.attributes, null, 2 )}\n---\n${ticket.description}`

export function ticketNamespaceDetails () {
  return nameSpaceDetailsForGit ( 'ticket', {
    extension: 'md',
    mimeType: 'text/markdown; charset=UTF-8',
    parser: ticketParser,
    writer: ticketWriter,
  } );
}
