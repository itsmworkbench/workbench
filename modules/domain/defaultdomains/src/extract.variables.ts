import { addManyVariablesFromSelectedAndList, Variables, VariablesExtractor } from "@itsmworkbench/variables";
import { ErrorsAnd, hasErrors, NameAnd } from "@laoban/utils";
import { Operator } from "@itsmworkbench/domain";
import { KnowledgeArticles } from "@itsmworkbench/knowledge_articles";
import { Ticket, variablesFromTicket } from "@itsmworkbench/tickets";
import { SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";

export function extractVariablesForAllDomain ( ve: VariablesExtractor,
                                               operator: Operator,
                                               ticket: Ticket,
                                               kas: KnowledgeArticles,
                                               scs: SoftwareCatalogs ): NameAnd<Variables> {
  let op: NameAnd<Variables> = {
    Operator: { variables: operator as any, errors: [] },
  }
  const ticketErrorsAndVariables: ErrorsAnd<Variables> = variablesFromTicket ( op, ticket )
  const withTickets: Variables = hasErrors ( ticketErrorsAndVariables ) ?
    { variables: {}, errors: ticketErrorsAndVariables } :
    { variables: ticketErrorsAndVariables, errors: [] }
  const start: NameAnd<Variables> = { ...op, Ticket: withTickets }


  const { result, acc, errors } = addManyVariablesFromSelectedAndList ( ve,
    start,
    { 'Knowledge Article': kas, 'Software Catalog': scs } )
  result[ 'Summary' ] = { variables: acc, errors }
  return result
}
