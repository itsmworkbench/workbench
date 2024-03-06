import { nameSpaceDetails, OrganisationUrlStoreConfig } from "@itsmworkbench/url";
import { YamlCapability } from "@itsmworkbench/yaml";
import { camelCaseAndIdAndNameParser, camelCaseAndIdYamlParser } from "@itsmworkbench/domain";
import { ticketParser, ticketWriter } from "@itsmworkbench/tickets";


export function kaNs ( yaml: YamlCapability ) {
  return nameSpaceDetails ( 'ka', {
    parser: camelCaseAndIdYamlParser ( yaml ),
    writer: yaml.writer
  } );
}

export function scNs ( yaml: YamlCapability ) {
  return nameSpaceDetails ( 'sc', {
    parser: camelCaseAndIdAndNameParser ( yaml ),
    writer: yaml.writer,
  } );
}

export function ticketNs () {
  return nameSpaceDetails ( 'ticket', {
    extension: 'md',
    parser: ticketParser,
    writer: ticketWriter,
  } );
}
export function operatorNs ( yaml: YamlCapability ) {
  return nameSpaceDetails ( 'operator', {
    parser: camelCaseAndIdYamlParser ( yaml ),
    writer: yaml.writer,
  } );
}
export function defaultOrganisationUrlStoreConfig ( yaml: YamlCapability ): OrganisationUrlStoreConfig {
  return {
    baseDir: 'organisations',
    nameSpaceDetails: {
      ks: kaNs ( yaml ),
      sc: scNs ( yaml ),
      ticket: ticketNs (),
      operator: operatorNs ( yaml )
    }
  }
}