import { NameAnd } from "@laoban/utils";
import { JSONPrimitive, simpleTemplate } from "@itsmworkbench/utils";
import { FetchFn } from "@itsmworkbench/indexing";
import { VectorisationFn } from "./domain";

export type PineconeConfig = {
  url: string
  auth: NameAnd<string>
  dryRun: boolean
  debug: boolean
  fields: NameAnd<string[]>//index to fields

}


export type IndexAndId = {
  index: {
    _index: string
    _id: string
  }
}
export type PineconeBody = {
  id: string,
  values: number[],
  metadata: Record<string, JSONPrimitive>
}
export type PineconeIndexandBody = {
  index: string
  body: PineconeBody
}
export type TwoLines = [ IndexAndId, NameAnd<JSONPrimitive> ]
type ProcessTwoLines<T> = ( pair: TwoLines ) => T;
function processTwoLinesAtATime<T> ( lines: string[], fn: ProcessTwoLines<T> ): T[] {
  const result: T[] = [];
  for ( let i = 0; i < lines.length; i += 2 ) {
    result.push ( fn ( [ JSON.parse ( lines[ i ] ), JSON.parse ( lines[ i + 1 ] ) ] ) );
  }
  return result;
}
async function processTwoLinesAtATimeK<T> ( lines: string[], fn: ProcessTwoLines<Promise<T>> ): Promise<T[]> {
  const result: T[] = [];
  for ( let i = 0; i < lines.length; i += 2 ) {
    result.push ( await fn ( [ JSON.parse ( lines[ i ] ), JSON.parse ( lines[ i + 1 ] ) ] ) );
  }
  return result;
}

export function validatePineconfigConfig ( prefix: string, config: PineconeConfig ): PineconeConfig {
  const { url, auth, dryRun, debug, fields } = config
  if ( !url ) throw new Error ( `${prefix} url is required` );
  if ( typeof url !== 'string' ) throw new Error ( `${prefix} url must be a string` );
  if ( !auth ) throw new Error ( `${prefix} auth is required` );
  if ( typeof auth !== 'object' ) throw new Error ( `${prefix} auth must be an object` );
  if ( dryRun === undefined ) throw new Error ( `${prefix} dryRun is required` );
  if ( typeof dryRun !== 'boolean' ) throw new Error ( `${prefix} dryRun must be a boolean` );
  if ( debug === undefined ) throw new Error ( `${prefix} debug is required` );
  if ( typeof debug !== 'boolean' ) throw new Error ( `${prefix} debug must be a boolean` );
  if ( fields === undefined ) throw new Error ( `${prefix} fields is required` )
  if ( typeof fields !== 'object' ) throw new Error ( `${prefix} fields must be an object` )
  for ( const [ name, value ] of Object.entries ( fields ) ) {
    if ( !Array.isArray ( value ) ) throw new Error ( `${prefix} fields must be an object of arrays` )
    for ( const f of value ) if ( typeof f !== 'string' ) throw new Error ( `${prefix} fields must be an object of arrays of strings` )
  }

  return { url, auth, fields, dryRun, debug }

}

export const turnEsIndexToPineconeIndexAndBody = ( indexToFields: NameAnd<string[]>, vectorise: VectorisationFn ): ProcessTwoLines<Promise<PineconeIndexandBody>> =>
  async ( twoLines: TwoLines ): Promise<PineconeIndexandBody> => {
    if ( twoLines.length !== 2 ) throw new Error ( `Expected two lines, got ${twoLines.length}` )
    const index = twoLines[ 0 ].index;
    if ( index._index === undefined ) throw new Error ( `Expected _index in first line, got ${JSON.stringify ( twoLines[ 0 ] )}` )
    if ( index._id === undefined ) throw new Error ( `Expected _id in first line, got ${JSON.stringify ( twoLines[ 0 ] )}` )
    const metadata = twoLines[ 1 ];
    const fields = indexToFields[ index._index ];
    if ( fields === undefined ) throw new Error ( `Missing fields for index ${index._index}\n${JSON.stringify ( twoLines )}` )
    const text = Object.keys ( metadata ).filter ( k => fields.indexOf ( k ) !== -1 ).map ( k => metadata[ k ] ).join ( ' ' )
    return {
      index: index._index,
      body: {
        id: index._id,
        values: await vectorise ( text ),
        metadata
      }
    }
  };

export async function massTurnEsIndexToPineconeIndexAndBody ( fields: NameAnd<string[]>, vectorise: VectorisationFn, lines: string[] ) {
  const indicesAndBody = await processTwoLinesAtATimeK ( lines, turnEsIndexToPineconeIndexAndBody ( fields, vectorise ) );
  const result: NameAnd<PineconeBody[]> = {};
  for ( const ib of indicesAndBody ) {
    if ( result[ ib.index ] === undefined ) result[ ib.index ] = [];
    result[ ib.index ].push ( ib.body );
  }
  return result
}
export async function postAllIndexes ( fetch: FetchFn, config: PineconeConfig, indicesAndBody: NameAnd<PineconeBody[]> ): Promise<boolean> {
  let ok = true
  validatePineconfigConfig ( 'Pinecone config', config )
  for ( const [ index, bodies ] of Object.entries ( indicesAndBody ) ) {
    const body = JSON.stringify ( bodies );
    const url = simpleTemplate ( config.url, { index } );
    if ( config.dryRun || config.debug ) console.log ( 'posting to pinecone', url, 'post', body )
    if ( config.dryRun ) continue
    const response = await fetch ( url, {
      method: "Post",
      headers: {
        "Authorization": config.auth.Authorization,
        "Content-Type": "application/json"
      },
      body
    } );
    if ( response.ok ) {
      console.log ( `Successfully indexed ${bodies.length} documents into ${index}` );
    } else {
      ok = false
      console.error ( `Failed to index ${bodies.length} documents into ${index}\n${response.status} ${response.text ()}` );
    }
  }
  return ok
}
