import { VariablesExtractor } from "@itsmworkbench/variables";
import { DomainPlugin } from "@itsmworkbench/domain";

import { kaPlugin } from "@itsmworkbench/knowledge_articles";
import { Ticket, ticketsPlugin } from "@itsmworkbench/tickets";
import { softwareCatalogPlugin } from "@itsmworkbench/softwarecatalog";
import { Template, templatePlugin } from "@itsmworkbench/templates";
import { YamlCapability } from "@itsmworkbench/yaml";
import { operatorPlugin } from "@itsmworkbench/operator";


// const operatorP: DomainPlugin<Operator> = operatorPlugin ( 'operator' )
const ticketP: DomainPlugin<Ticket> = ticketsPlugin ( 'tickets' )
// const scP: DomainPlugin<SoftwareCatalog> = softwareCatalogPlugin ( 'scs' )
const templateP: DomainPlugin<Template> = templatePlugin ( 'templates' )

export function defaultVariablesExtractor ( yaml: YamlCapability ): VariablesExtractor {
  return {
    operator: operatorPlugin ( yaml, 'operator' ).variablesExtractor,
    ka: kaPlugin ( yaml, 'ka' ).variablesExtractor,
    ticket: ticketP.variablesExtractor,
    sc: softwareCatalogPlugin ( yaml, 'scs' ).variablesExtractor,
    template: templateP.variablesExtractor
  }
}

