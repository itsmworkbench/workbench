import { NameAnd } from "@laoban/utils";
import { VectorisationFn } from "./domain";
import { FetchFn } from "@itsmworkbench/indexing";
import { deref } from "@itsmworkbench/actions";

export type TitanConfig = {
  url: string
  auth: NameAnd<string>
  modelId: string
  dryRun: boolean
  debug: boolean
}

export function validateTitanConfig ( prefix: string, config: TitanConfig ): TitanConfig {
  const { url, auth, modelId, dryRun, debug } = config
  if ( !url ) throw new Error ( `${prefix} url is required` );
  if ( typeof url !== 'string' ) throw new Error ( `${prefix} url must be a string` );
  if ( !auth ) throw new Error ( `${prefix} auth is required` );
  if ( typeof auth !== 'object' ) throw new Error ( `${prefix} auth must be an object` );
  if ( !modelId ) throw new Error ( `${prefix} modelId is required` );
  if ( typeof modelId !== 'string' ) throw new Error ( `${prefix} modelId must be a string` );
  return { url, modelId, auth, dryRun, debug }
}

export function titanVectorisation ( titanConfig: TitanConfig, fetchFn: FetchFn ): VectorisationFn {
  validateTitanConfig ( 'Titan', titanConfig )
  const { url, auth, modelId, dryRun, debug } = titanConfig
  return async ( text: string ) => {
    const body = JSON.stringify ( { ModelId: modelId, 'ContentType': 'text/plain', Body: text } )
    if ( debug || dryRun ) console.log ( 'Titan', url, body )
    if ( dryRun ) return [ 0, 1, 2, 3, 4, 5 ]
    const response = await fetchFn ( url, {
      method: 'Post',
      headers: auth
    } )
    if ( !response.ok ) throw new Error ( `Failed to fetch Titan response: ${response.status} ${response.statusText}` )
    const json = await response.json ()
    const embedding = json.embedding;
    if ( !embedding ) throw new Error ( `Expected embedding in titan response: ${JSON.stringify ( json )}` )
    if ( !Array.isArray ( embedding ) ) throw new Error ( `Expected embedding to be an array, got ${JSON.stringify ( embedding )}` )
    for ( const e of embedding ) if ( typeof e !== 'number' ) throw new Error ( `Expected embedding to be an array of numbers, got ${JSON.stringify ( embedding )}` )
    return embedding
  }
}