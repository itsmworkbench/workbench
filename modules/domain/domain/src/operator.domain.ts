import { ParserStoreParser } from "@itsmworkbench/parser";
import { ErrorsAnd, mapErrors, NameAnd } from "@laoban/utils";
import { transformKeysToCamelCase } from "@itsmworkbench/utils";
import { Variables } from "@itsmworkbench/variables";
import { DomainPlugin } from "./domain.plugin";
import { YamlCapability } from "@itsmworkbench/yaml";
import { camelCaseAndIdYamlParser } from "./domain";

const yaml = require ( 'js-yaml' );

export interface Operator {
  name: string
  email: string
}



export function variablesFromOperator ( sofar: NameAnd<any>, operator: Operator ): ErrorsAnd<Variables> {
  return { variables: operator as any, errors: [] }
}

export function operatorPlugin ( yaml: YamlCapability, rootPath: string ): DomainPlugin<Operator> {
  return {
    prefix: 'operator',
    parser: camelCaseAndIdYamlParser ( yaml ),
    writer: yaml.writer,
    variablesExtractor: variablesFromOperator,
    idStoreDetails: { extension: 'yaml', rootPath, mimeType: 'text/yaml; charset=UTF-8' }
  }
}
