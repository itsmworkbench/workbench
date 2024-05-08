import { NameAnd } from "@laoban/utils";
import { consoleIndexTreeLogAndMetrics, defaultTreeLogAndMetrics, IndexTreeLogAndMetrics } from "./tree.index";
import { consoleIndexForestLogAndMetrics, defaultForestLogAndMetrics, IndexForestLogAndMetrics, nullIndexForestLogAndMetrics } from "./forest.index";
import { ApiKeyAuthentication, Authentication, BasicAuthentication, isApiKeyAuthentication, isBasicAuthentication, isOAuthAuthentication } from "@itsmworkbench/indexconfig";
import { consoleIndexParentChildLogAndMetrics, defaultIndexParentChildLogAndMetrics, IndexParentChildLogAndMetrics } from "./index.parent.child";
import { WithPaging } from "./indexer.domain";

export type TokenAuthentication = {
  token: string
}

export type SourceSinkDetails = {
  baseurl: string;
  authentication: Authentication;
}

export type AuthFn = ( auth: Authentication ) => Promise<NameAnd<string>>
function authForApiToken ( env: NameAnd<string>, auth: ApiKeyAuthentication ) {
  const apiKey = auth.credentials?.apiKey;
  if ( !apiKey ) throw Error ( 'No apiKey in ' + JSON.stringify ( auth ) )
  const token = env[ apiKey ]
  if ( !token ) throw Error ( 'No token for apiKey ' + apiKey )
  return { Authorization: `Bearer ${token}` }
}
function authForBasic ( env: NameAnd<string>, auth: BasicAuthentication ) {
  if ( !auth.credentials.username ) throw Error ( 'No username in ' + JSON.stringify ( auth ) )
  if ( !auth.credentials.password ) throw Error ( 'No password in ' + JSON.stringify ( auth ) )
  const password = env[ auth.credentials.password ]
  if ( !password ) throw Error ( 'No password in environment for ' + auth.credentials.password )
  return { Authorization: `Basic ${Buffer.from ( `${auth.credentials.username}:${password}` ).toString ( 'base64' )}` }
}
export const defaultAuthFn = ( env: NameAnd<string> ): AuthFn => async ( auth: Authentication ) => {
  if ( isOAuthAuthentication ( auth ) ) throw Error ( 'OAuth not supported yet' )
  if ( isApiKeyAuthentication ( auth ) ) return authForApiToken ( env, auth );
  if ( isBasicAuthentication ( auth ) ) return authForBasic ( env, auth );
  throw Error ( 'Unknown auth method ' + JSON.stringify ( auth ) )
};
export type FetchFnResponse = {
  status: number;
  ok: boolean;
  json (): Promise<any>;
  text (): Promise<string>;
  headers: NameAnd<string>;
  statusText: string;
}

export type FetchFnOptions = {
  method: 'Get' | 'Post' | 'Put' | 'Delete';
  headers: NameAnd<string>;
  body: string
}
export type FetchFn = ( url: string, options?: FetchFnOptions ) => Promise<FetchFnResponse>


export type IndexingContext = {
  authFn: AuthFn;
  parentChildLogAndMetrics: IndexParentChildLogAndMetrics
  treeLogAndMetrics: IndexTreeLogAndMetrics
  forestLogAndMetrics: IndexForestLogAndMetrics
  fetch: FetchFn
}
export function defaultIndexingContext ( env: NameAnd<string>, fetch: FetchFn, metrics: NameAnd<number> ): IndexingContext {
  return {
    authFn: defaultAuthFn ( env ),
    treeLogAndMetrics: defaultTreeLogAndMetrics ( metrics, consoleIndexTreeLogAndMetrics ),
    forestLogAndMetrics: defaultForestLogAndMetrics ( metrics, consoleIndexForestLogAndMetrics ),
    parentChildLogAndMetrics: defaultIndexParentChildLogAndMetrics ( metrics, consoleIndexParentChildLogAndMetrics ),
    fetch: ( url, options ) => {
      const u = new URL ( url )
      const domainKey = 'fetch.' + u.hostname
      metrics[ domainKey ] = metrics[ domainKey ] ? metrics[ domainKey ] + 1 : 1
      return fetch ( url, options )
    }
  }
}
export function consoleIndexingContext ( env: NameAnd<string>, fetch: FetchFn ): IndexingContext {
  return {
    authFn: defaultAuthFn ( env ),
    treeLogAndMetrics: consoleIndexTreeLogAndMetrics,
    forestLogAndMetrics: consoleIndexForestLogAndMetrics,
    parentChildLogAndMetrics: consoleIndexParentChildLogAndMetrics,
    fetch
  }
}


export type AccessConfig<L> = {

  method?: 'Get' | 'Post' | 'Put' | 'Delete';
  body?: any;
  extraHeaders?: NameAnd<string>;
  pagingFn?: ( json: any, linkHeader: string | undefined ) => L | undefined
}
export async function access<T, L> ( ic: IndexingContext, details: SourceSinkDetails, offsetUrl: string, config: AccessConfig<L> ): Promise<WithPaging<T, L>> {
  const { method, body, extraHeaders, pagingFn } = config;
  const authHeaders = await ic.authFn ( details.authentication )
  const fullUrl = offsetUrl.startsWith ( 'http' ) ? offsetUrl : details.baseurl + offsetUrl;
  const headers = { ...authHeaders, ...(extraHeaders || {}) };
  const response = await ic.fetch ( fullUrl, {
    method: method || 'Get',
    headers: headers,
    body: body
  } );
  if ( response.status === 404 )
    throw Error ( 'Not Found' )
  if ( !response.ok )
    throw new Error ( `Error fetching ${fullUrl}: ${response.statusText}\n${await response.text ()}` )
  try {
    const json = await response.json ();
    const page = pagingFn?. ( json, response.headers[ 'link' ] )
    const data = json;
    return { data: data, page }
  } catch ( e: any ) {
    throw e
  }
}
