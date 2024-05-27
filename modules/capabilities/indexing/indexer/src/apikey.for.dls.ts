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
  headers: NameAnd<string>
  deletePrevious: boolean
}
export function apiKeyDetails ( opts: NameAnd<any>, env: NameAnd<string> ): ApiKeyDetails {
  return {
    username: opts.username,
    elasticSearchUrl: opts.elasticSearch.toString (),
    index: opts.index || [],
    deletePrevious: opts.deletePrevious || false,
    headers: getElasticSearchAuthHeaderWithBasicToken ( env, opts.username, opts.password )
  }
}

export async function loadQueriesForEmail ( fetchFn: FetchFn, apiKeyDetails: ApiKeyDetails, email: string ) {
  const { elasticSearchUrl, index, headers } = apiKeyDetails
  const queries = await mapK ( index, async i => {
    const esUrl = `${elasticSearchUrl}.search-acl-filter-${i}/_doc/${encodeURIComponent ( email )}`;
    const response = await fetchFn ( esUrl, { headers } )
    if ( response.ok ) {
      let json = await response.json ();
      if ( json._source.query === undefined ) throw new Error ( `No query found for ${email} in ${i}\n${JSON.stringify ( json )}` )
      return JSON.parse ( json._source.query );
    }
    throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
  } )
  return {
    bool: { should: queries }
  }
}

export async function makeApiKey ( fetchFn: FetchFn, apiDetails: ApiKeyDetails, email: string, query: any ) {
  const body = {
    name: `dls_for_${email}`,
    role_descriptors: {
      "search": {
        "cluster": [ "all" ],
        "index": [
          {
            "names": apiDetails.index,
            "privileges": [ "read" ],
            query
          }
        ],
        // restriction: { workflows: [ "search_application_query" ] }
      },
    },
  }
  const response = await fetchFn ( `${apiDetails.elasticSearchUrl}_security/api_key`, {
    headers: { ...apiDetails.headers, 'Content-Type': 'application/json' },
    method: 'Post',
    body: JSON.stringify ( body )
  } )
  console.log ( JSON.stringify ( body, null, 2 ) )
  if ( response.ok ) return { ...await response.json (), username: apiDetails.username }
  throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
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
  const response = await fetchFn ( `${apiDetails.elasticSearchUrl}_security/api_key`, {
    headers: { ...apiDetails.headers, 'Content-Type': 'application/json' },
    method: 'Delete',
    body: JSON.stringify ( { ids: apiKeys.map ( k => k.id ) } )
  } )
  if ( response.ok ) return await response.json ()
  throw new Error ( `Error ${response.status} ${response.statusText} ${await response.text ()}` )
}
