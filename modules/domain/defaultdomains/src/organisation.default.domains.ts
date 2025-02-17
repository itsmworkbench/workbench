import { NameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit } from "@itsmworkbench/urlstore";
import { YamlCapability } from "@itsmworkbench/yaml";
import { operatorNameSpaceDetails } from "@itsmworkbench/operator";
import { ticketNamespaceDetails } from "@itsmworkbench/tickets";
import { NameAnd } from "@itsmworkbench/utils";

import { ticketEventsNameSpaceDetails } from "@itsmworkbench/ticketevents";
import { knowledgeArticleNamespaceDetails } from "@itsmworkbench/knowledgearticle";
import { Env } from "@itsmworkbench/utils";


//Even though this is 'for git' it can be safely used by the 'for api' version
export function defaultNameSpaceDetails ( yaml: YamlCapability, env: Env ): NameAnd<NameSpaceDetailsForGit> {
  return {
    ka: knowledgeArticleNamespaceDetails ( yaml ),
    ticket: ticketNamespaceDetails (),
    operator: operatorNameSpaceDetails ( yaml, env ),
    ticketevents: ticketEventsNameSpaceDetails ()
  }
}
export function defaultOrganisationUrlStoreConfig ( yaml: YamlCapability, env: Env ): OrganisationUrlStoreConfigForGit {
  return {
    baseDir: 'organisations',
    nameSpaceDetails: defaultNameSpaceDetails ( yaml, env )
  }
}