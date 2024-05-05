import { NameAnd } from "@laoban/utils";
import { consoleIndexTreeLogAndMetrics, IndexTreeLogAndMetrics } from "./tree.index";
import { consoleIndexForestLogAndMetrics, IndexForestLogAndMetrics } from "./forest.index";
import { ApiKeyAuthentication, Authentication, BasicAuthentication, isApiKeyAuthentication, isBasicAuthentication, isOAuthAuthentication } from "@itsmworkbench/indexconfig";
import { consoleIndexParentChildLogAndMetrics, IndexParentChildLogAndMetrics } from "./index.parent.child";

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
export function defaultIndexingContext ( env: NameAnd<string>, fetch: FetchFn ): IndexingContext {
  return {
    authFn: defaultAuthFn ( env ),
    treeLogAndMetrics: consoleIndexTreeLogAndMetrics,
    forestLogAndMetrics: consoleIndexForestLogAndMetrics,
    parentChildLogAndMetrics: consoleIndexParentChildLogAndMetrics,
    fetch
  }
}


export async function access ( ic: IndexingContext, details: SourceSinkDetails, offsetUrl, method?, body?: any, extraHeaders?: NameAnd<string> ) {
  const authHeaders = await ic.authFn ( details.authentication )
  const fullUrl = details.baseurl + offsetUrl;
  const headers = { ...authHeaders, ...(extraHeaders || {}) };
  const response = await ic.fetch ( fullUrl, {
    method: method || 'GET',
    headers: headers,
    body: body
  } );
  if ( response.status === 404 )
    throw Error ( 'Not Found' )
  if ( !response.ok )
    throw new Error ( `Error fetching ${fullUrl}: ${response.statusText}` )
  try {
    const result = await response.json ();
    return result
  } catch ( e: any ) {
    throw e
  }
}
