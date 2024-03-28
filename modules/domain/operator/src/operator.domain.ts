import { ErrorsAnd, NameAnd } from "@laoban/utils";
import { Variables } from "@itsmworkbench/variables";

import { YamlCapability } from "@itsmworkbench/yaml";
import { nameSpaceDetailsForGit } from "@itsmworkbench/urlstore";
import { camelCaseAndIdYamlParser } from "@itsmworkbench/domain";
import { derefence, dollarsBracesVarDefn } from "@laoban/variables";


export interface Operator {
  name: string
  email: string
}


export function variablesFromOperator ( sofar: NameAnd<any>, operator: Operator ): ErrorsAnd<Variables> {
  return { variables: operator as any, errors: [] }
}

export function operatorNameSpaceDetails ( yaml: YamlCapability, env: NameAnd<string> ) {
  return nameSpaceDetailsForGit ( 'operator', {
    parser: ( id, s ) => {
      const transformed = derefence ( `emailConfig`, { env }, s, { variableDefn: dollarsBracesVarDefn, emptyTemplateReturnsSelf: true } )
      return camelCaseAndIdYamlParser ( yaml ) ( id, transformed )
    },
    writer: yaml.writer,
  } );
}
