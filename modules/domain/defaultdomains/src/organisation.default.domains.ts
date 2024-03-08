import { nameSpaceDetails, NameSpaceDetailsForGit, nameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit } from "@itsmworkbench/url";
import { YamlCapability } from "@itsmworkbench/yaml";
import { camelCaseAndIdAndNameParser, camelCaseAndIdYamlParser } from "@itsmworkbench/domain";
import { ticketParser, ticketWriter } from "@itsmworkbench/tickets";
import { NameAnd } from "@laoban/utils";


export function kaNs ( yaml: YamlCapability ) {
  return nameSpaceDetailsForGit ( 'ka', {
    parser: camelCaseAndIdYamlParser ( yaml ),
    writer: yaml.writer
  } );
}

export function scNs ( yaml: YamlCapability ) {
  return nameSpaceDetailsForGit ( 'sc', {
    parser: camelCaseAndIdAndNameParser ( yaml ),
    writer: yaml.writer,
  } );
}

export function ticketNs () {
  return nameSpaceDetailsForGit ( 'ticket', {
    extension: 'md',
    mimeType: 'text/markdown; charset=UTF-8',
    parser: ticketParser,
    writer: ticketWriter,
  } );
}
export function operatorNs ( yaml: YamlCapability ) {
  return nameSpaceDetailsForGit ( 'operator', {
    parser: camelCaseAndIdYamlParser ( yaml ),
    writer: yaml.writer,
  } );
}

//Even though this is 'for git' it can be safely used by the 'for api' version
export function defaultNameSpaceDetails ( yaml: YamlCapability ): NameAnd<NameSpaceDetailsForGit> {
  return {
    ks: kaNs ( yaml ),
    sc: scNs ( yaml ),
    ticket: ticketNs (),
    operator: operatorNs ( yaml )
  }
}
export function defaultOrganisationUrlStoreConfig ( yaml: YamlCapability ): OrganisationUrlStoreConfigForGit {
  return {
    baseDir: 'organisations',
    nameSpaceDetails: defaultNameSpaceDetails ( yaml )
  }
}