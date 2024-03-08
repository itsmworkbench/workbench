import { NameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit } from "@itsmworkbench/url";
import { YamlCapability } from "@itsmworkbench/yaml";
import { operatorNameSpaceDetails } from "@itsmworkbench/operator";
import { ticketNamespaceDetails } from "@itsmworkbench/tickets";
import { NameAnd } from "@laoban/utils";
import { knowledgeArticleNameSpaceDetails } from "@itsmworkbench/knowledge_articles";
import { softwareCatalogNameSpaceDetails } from "@itsmworkbench/softwarecatalog";
import { ticketEventsNameSpaceDetails } from "@itsmworkbench/ticketevents";


//Even though this is 'for git' it can be safely used by the 'for api' version
export function defaultNameSpaceDetails ( yaml: YamlCapability ): NameAnd<NameSpaceDetailsForGit> {
  return {
    ks: knowledgeArticleNameSpaceDetails ( yaml ),
    sc: softwareCatalogNameSpaceDetails ( yaml ),
    ticket: ticketNamespaceDetails (),
    operator: operatorNameSpaceDetails ( yaml ),
    ticketevents: ticketEventsNameSpaceDetails ()
  }
}
export function defaultOrganisationUrlStoreConfig ( yaml: YamlCapability ): OrganisationUrlStoreConfigForGit {
  return {
    baseDir: 'organisations',
    nameSpaceDetails: defaultNameSpaceDetails ( yaml )
  }
}