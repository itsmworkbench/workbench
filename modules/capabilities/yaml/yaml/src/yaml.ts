import { ErrorsAnd, hasErrors } from "@laoban/utils";

export type YamlWriter = ( content: any ) => ErrorsAnd<string>
export type YamlParser = ( s: string ) => ErrorsAnd<any>

export const yamlWriterToStringWithErrorsEmbedded = ( writer: YamlWriter ) => ( s: string ) => {
  const result = writer ( s );
  if ( hasErrors ( result ) ) return result.join ( '\n' );
  return result;

}
export const yamlParserFromStringWithErrorsEmbedded = ( parser: YamlParser ) => ( content: any ) => {
  const result = parser ( content );
  if ( hasErrors ( result ) ) return result;
  return result;
}

export type YamlCapability = {
  parser: YamlParser
  writer: YamlWriter
}