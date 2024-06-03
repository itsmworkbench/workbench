import * as fs from "node:fs";
import { YamlCapability } from "@itsmworkbench/yaml";
import { hasErrors, NameAnd } from "@laoban/utils";
import { Indexer } from "@itsmworkbench/indexing";

export type IndexMappings = NameAnd<IndexMapping>
export type IndexMapping = {}

export function validateIndexMappings ( v: any ) {
  if ( typeof v !== 'object' ) throw new Error ( 'IndexMappings must be an object' )
  return v as IndexMappings

}
export async function loadAndValidateIndexMappings ( file: string, yaml: YamlCapability ): Promise<IndexMappings> {
  const text = await fs.promises.readFile ( file )
  const data = yaml.parser ( text.toString ( 'utf8' ) )
  if ( hasErrors ( data ) ) throw new Error ( data.join ( '\n' ) )
  return validateIndexMappings ( data )
}
