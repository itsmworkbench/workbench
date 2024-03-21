import { DomainPlugin } from "@itsmworkbench/domain";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { addVariables, extractVariablesFromMarkdown, Variables } from "@itsmworkbench/variables";
import { ParserStoreParser } from "@itsmworkbench/parser";
import { nameSpaceDetailsForGit } from "@itsmworkbench/url";

export interface Ticket {
  id: string
  attributes: NameAnd<any>
  description: string
}


export function variablesFromTicket ( sofar: NameAnd<any>, t: Ticket ): ErrorsAnd<Variables> {
  return addVariables ( extractVariablesFromMarkdown ( t.description ), { id: t.id } )
}

export const ticketParser: ParserStoreParser = ( id, s ) => {
  const index = s.indexOf ( '\n---\n' )
  if ( index === -1 ) return { attributes: {}, description: s }
  return { attributes: JSON.parse ( s.substring ( 0, index ).trim () ), description: s.substring ( index + 5 ) }
}
export const ticketWriter = ( ticket: Ticket ) => `${JSON.stringify(ticket.attributes, null, 2)}\n---\n${ticket.description}`
export function ticketsPlugin ( rootPath: string ): DomainPlugin<Ticket> {
  return {
    prefix: 'ticket',
    parser: ticketParser,
    writer: ticketWriter,
    variablesExtractor: variablesFromTicket,
    idStoreDetails: { extension: 'md', rootPath, mimeType: 'text/markdown; charset=UTF-8' }
  }
}

export function ticketNamespaceDetails () {
  return nameSpaceDetailsForGit ( 'ticket', {
    extension: 'md',
    mimeType: 'text/markdown; charset=UTF-8',
    parser: ticketParser,
    writer: ticketWriter,
  } );
}
