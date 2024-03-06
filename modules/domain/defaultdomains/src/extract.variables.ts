import { addManyVariablesFromSelectedAndList, Variables, VariablesExtractor } from "@itsmworkbench/variables";
import { NameAnd } from "@laoban/utils";
import { Operator } from "@itsmworkbench/domain";
import { KnowledgeArticles } from "@itsmworkbench/knowledge_articles";
import { Tickets } from "@itsmworkbench/tickets";
import { SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";

export function extractVariablesForAllDomain ( ve: VariablesExtractor,
                                               operator: Operator,
                                               tickets: Tickets,
                                               kas: KnowledgeArticles,
                                               scs: SoftwareCatalogs ): NameAnd<Variables> {
  const { result, acc, errors } = addManyVariablesFromSelectedAndList ( ve,
    { Operator: { variables: operator as any, errors: [] } },
    { Ticket: tickets, 'Knowledge Article': kas, 'Software Catalog': scs } )
  result[ 'Summary' ] = { variables: acc, errors }
  return result
}
