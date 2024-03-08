import { DomainPlugin } from "@itsmworkbench/domain";
import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { addVariables, extractVariablesFromMarkdown, Variables } from "@itsmworkbench/variables";
import { ParserStoreParser } from "@itsmworkbench/parser";
import { nameSpaceDetailsForGit } from "@itsmworkbench/url";

export interface Ticket {
  id: string
  description: string
}


export function variablesFromTicket ( sofar: NameAnd<any>, t: Ticket ): ErrorsAnd<Variables> {
  return addVariables ( extractVariablesFromMarkdown ( t.description ), { id: t.id } )
}

export const ticketParser: ParserStoreParser = ( id, s ) => {
  let ticket: Ticket = { id, description: s }
  return ticket
}
export const ticketWriter = ( ticket: Ticket ) => ticket.description;
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
