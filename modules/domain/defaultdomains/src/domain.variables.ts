import { VariablesExtractor } from "@itsmworkbench/variables";
import { DomainPlugin } from "@itsmworkbench/domain";
import { ParserStore } from "@itsmworkbench/parser";
import { kaPlugin } from "@itsmworkbench/knowledge_articles";
import { Ticket, ticketsPlugin } from "@itsmworkbench/tickets";
import { AllIdStoreDetails } from "@itsmworkbench/idstore";
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

export function defaultParserStore ( yaml: YamlCapability ): ParserStore {
  return {
    json: ( id, s ) => JSON.parse ( s ),
    string: ( id, s ) => s,
    operator: operatorPlugin ( yaml, 'operator' ).parser,
    ticket: ticketP.parser,
    sc: softwareCatalogPlugin ( yaml, 'scs' ).parser,
    ka: kaPlugin ( yaml, 'ka' ).parser,
    template: templateP.parser
  }
}
export function defaultIdStoreDetails ( root: string, yaml: YamlCapability, parserStore: ParserStore ): AllIdStoreDetails {
  const operatorP = operatorPlugin ( yaml, 'operator' )
  const scP = softwareCatalogPlugin ( yaml, 'scs' )
  const kaP = kaPlugin ( yaml, 'ka' )
  return {
    parserStore, details: {
      operator: { ...operatorP.idStoreDetails, rootPath: root + '/' + operatorP.idStoreDetails.rootPath },
      ka: { ...kaP.idStoreDetails, rootPath: root + '/' + kaP.idStoreDetails.rootPath },
      sc: { ...scP.idStoreDetails, rootPath: root + '/' + scP.idStoreDetails.rootPath },
      ticket: { ...ticketP.idStoreDetails, rootPath: root + '/' + ticketP.idStoreDetails.rootPath },
      template: { ...templateP.idStoreDetails, rootPath: root + '/' + templateP.idStoreDetails.rootPath }
    }
  }
}
