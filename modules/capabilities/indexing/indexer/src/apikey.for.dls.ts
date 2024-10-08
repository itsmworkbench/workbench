import { FetchFn } from "@itsmworkbench/indexing";
import { mapK, NameAnd } from "@laoban/utils";

export function getElasticSearchToken ( env: NameAnd<string>, token: string | boolean ) {
  const tokenValue = env[ token.toString () ]
  if ( tokenValue === undefined ) {
    throw new Error ( 'Environment variable [' + token + '] not defined' )
  }
  return tokenValue;
}
export function getElasticSearchAuthHeaderWithApiToken ( env: NameAnd<string>, token: string | boolean ) {
  return {
    'Authorization': `ApiKey ${getElasticSearchToken ( env, token )}`
  }
}
export function getElasticSearchAuthHeaderWithBasicToken ( env: NameAnd<string>, username, password: string | boolean ) {
  return {
    'Authorization': `Basic ${Buffer.from ( `${username}:${getElasticSearchToken ( env, password )}` ).toString ( 'base64' )}`
  }
}
export type ApiKeyDetails = {
  username: string
  elasticSearchUrl: string
  index: string[]
  uncontrolled: string[]
  headers: NameAnd<string>
  deletePrevious: boolean
}

export function apiKeyDetails ( opts: NameAnd<any>, env: NameAnd<string> ): ApiKeyDetails {
  return {
    username: opts.username,
    elasticSearchUrl: opts?.elasticSearch?.toString (),
    index: opts.index || [],
    uncontrolled: opts.uncontrolled || [],
    deletePrevious: opts.deletePrevious || false,
    headers: opts.username && opts.password ? getElasticSearchAuthHeaderWithBasicToken ( env, opts.username, opts.password ) : {}
  }
}

export type IndexAndQuery = { index: string, query?: any }

export async function loadQueriesForEmail ( fetchFn: FetchFn, apiKeyDetails: ApiKeyDetails, email: string ): Promise<IndexAndQuery> {
  const { elasticSearchUrl, index, headers } = apiKeyDetails
  const indexAndQueries = await mapK ( index, async i => {
      const esUrl = `${elasticSearchUrl}.search-acl-filter-${i}/_doc/${encodeURIComponent ( email )}`;
      const response = await fetchFn ( esUrl, { headers } )
      function parse ( json: any ): any {
        try {
          if (typeof json === 'object') return json
          return JSON.parse ( json );
        } catch ( e: any ) {
          console.error ( `Error parsing json for ${email} in ${i}\n${JSON.stringify ( json )}`, e )
          throw e
        }
      }
      if ( response.ok ) {
        let json = await response.json ();
        if ( json._source.query === undefined ) throw new Error ( `No query found for ${email} in ${i}\n${JSON.stringify ( json )}` )
        return { index: i, query: parse ( json._source.query ) }
      }
      if ( response.status === 404 )
        return { index: i }
      throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
    }
  )
  const allQueries = indexAndQueries.filter ( q => q.query !== undefined ).map ( i => i.query )
  const allIndexes = indexAndQueries.filter ( q => q.query !== undefined ).map ( i => i.index )
  let query = { bool: { should: [ ...allQueries, ...makeQueriesForUncontrolled ( apiKeyDetails.uncontrolled ) ].filter ( q => q !== undefined ) } };
  return { index: allIndexes.join ( ',' ), query }
}

export function makeQueriesForUncontrolled ( uncontrolled: string[] ) {
  return uncontrolled.map ( u => ({ term: { _index: u } }) )
}

export async function makeApiKey ( fetchFn: FetchFn, apiDetails: ApiKeyDetails, email: string, query: any ) {
  const body = {
    name: `dls_for_${email}`,
    role_descriptors: {
      "search": {
        "cluster": [ "all" ],
        "index": [
          {
            "names": [ ...apiDetails.index, ...apiDetails.uncontrolled ],
            "privileges": [ "read" ],
            query
          }
        ],
        // restriction: { workflows: [ "search_application_query" ] }
      },
    },
  }
  console.log ( 'making api key', JSON.stringify ( body, null, 2 ), 'header', apiDetails.headers )
  try {
    const response = await fetchFn ( `${apiDetails.elasticSearchUrl}_security/api_key`, {
      headers: { ...apiDetails.headers, 'Content-Type': 'application/json' },
      method: 'Post',
      body: JSON.stringify ( body )
    } )
    console.log ( 'response', response.status, response.statusText )
    console.log ( JSON.stringify ( body, null, 2 ) )
    if ( response.ok ) return { ...await response.json (), username: apiDetails.username }
    throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
  } catch ( e ) {
    console.error ( `Error in makeApiKey`, e, JSON.stringify ( e ) )
    throw e;
  }
}

type ElasticSearchApiKey = { id: string, name: string }


export const fetchAllApiKeys = async ( fetchFn: FetchFn, apiDetails: ApiKeyDetails ): Promise<ElasticSearchApiKey[]> => {
  const response = await fetchFn ( `${apiDetails.elasticSearchUrl}_security/api_key`, {
    headers: apiDetails.headers
  } )
  if ( response.ok ) return (await response.json ()).api_keys
  throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
}

export const findApiKeysForEmail = ( fetchFn: FetchFn, apiDetails: ApiKeyDetails ) => async ( email: string ) => {
  const apiKeys = await fetchAllApiKeys ( fetchFn, apiDetails )
  return apiKeys.filter ( k => k.name === `dls_for_${email}` )
}
export const invalidateApiKeysForEmail = ( fetchFn: FetchFn, apiDetails: ApiKeyDetails ) => async ( email: string ) => {
  const apiKeys = await findApiKeysForEmail ( fetchFn, apiDetails ) ( email )
  console.log ( 'deleting', apiKeys )
  if ( apiKeys.length === 0 ) return;
  const response = await fetchFn ( `${apiDetails.elasticSearchUrl}_security/api_key`, {
    headers: { ...apiDetails.headers, 'Content-Type': 'application/json' },
    method: 'Delete',
    body: JSON.stringify ( { ids: apiKeys.map ( k => k.id ) } )
  } )
  if ( response.ok ) return await response.json ()
  throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
}
