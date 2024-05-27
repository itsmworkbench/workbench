import { NameAnd } from "@laoban/utils";
import { consoleIndexTreeLogAndMetrics, defaultTreeLogAndMetrics, IndexTreeLogAndMetrics } from "./tree.index";
import { consoleIndexForestLogAndMetrics, defaultForestLogAndMetrics, IndexForestLogAndMetrics } from "./forest.index";
import { ApiKeyAuthentication, Authentication, BasicAuthentication, EntraIdAuthentication, isApiKeyAuthentication, isBasicAuthentication, isEntraIdAuthentication, isPrivateTokenAuthentication, PrivateTokenAuthentication } from "@itsmworkbench/indexconfig";
import { consoleIndexParentChildLogAndMetrics, defaultIndexParentChildLogAndMetrics, IndexParentChildLogAndMetrics } from "./index.parent.child";
import { DateTimeService, Timeservice } from "@itsmworkbench/utils";
import { WithPaging } from "./paging";

export type TokenAuthentication = {
  token: string
}

export type SourceSinkDetails = {
  baseurl: string;
  auth: Authentication;
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
async function authForPrivate ( env: NameAnd<string>, auth: PrivateTokenAuthentication ) {
  const privateKey = auth.credentials?.token;
  if ( !privateKey ) throw Error ( 'No privateKey in ' + JSON.stringify ( auth ) )
  const token = env[ privateKey ]
  if ( !token ) throw Error ( 'No token for privateKey ' + privateKey )
  return { 'PRIVATE-TOKEN': token }
}

export type TokenAndTime = {
  token: string
  expires: number
}

export type TokenCache = NameAnd<Promise<TokenAndTime>>


export type AuthForEntraIdFn = ( env: NameAnd<string>, fetch: FetchFn, oauth: EntraIdAuthentication ) => Promise<TokenAndTime>
export const authForEntraId: AuthForEntraIdFn = async ( env: NameAnd<string>, fetch: FetchFn, oauth: EntraIdAuthentication ) => {
  const { tenantId, clientId, clientSecret, scope } = oauth.credentials;
  const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const body = new URLSearchParams ();
  const secret = env[ clientSecret ]
  if ( !secret ) throw Error ( `Need Environment variable for client secret ${clientSecret}` )
  body.append ( 'grant_type', 'client_credentials' );
  body.append ( 'client_id', clientId );
  body.append ( 'client_secret', secret );
  body.append ( 'scope', scope );

  const response = await fetch ( url, {
    method: 'Post',
    body: body.toString (),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  } );

  if ( !response.ok ) {
    throw new Error ( `Error fetching access token: ${response.statusText}` );
  }

  const data = await response.json ();
  return { token: data.access_token, expires: data.expires_in }
};
export async function getOrUpdateEntraId (
  fetch: FetchFn,
  timeService: Timeservice,
  oauth: EntraIdAuthentication,
  tokenCache: TokenCache,
  authForEntraIdFn: AuthForEntraIdFn = authForEntraId
): Promise<string> {
  const tokenDataPromise = tokenCache[ oauth.credentials.clientId ];
  if ( tokenDataPromise ) {
    const tokenData = await tokenDataPromise;
    if ( tokenData && tokenData.expires > timeService () ) return tokenData.token;
  }
  const newToken = authForEntraIdFn ( process.env, fetch, oauth ).then ( ( token: TokenAndTime ) => {
    if ( !token.token ) throw Error ( 'No access token in ' + JSON.stringify ( token ) )
    if ( !token.expires ) throw Error ( 'No expires in ' + JSON.stringify ( token ) )
    return ({ ...token, token: token.token, expires: timeService () + token.expires * 500 }) // we will get a new token well before the expiry is up
  } ).catch ( e => {
    console.error ( e );
    tokenCache[ oauth.credentials.clientId ] = undefined;
    throw e
  } )
  tokenCache[ oauth.credentials.clientId ] = newToken
  return (await newToken).token;
}
const globalTokenCache: TokenCache = {}
export const defaultAuthFn = ( env: NameAnd<string>, fetch: FetchFn, timeService: Timeservice, tokenCache: TokenCache = globalTokenCache ): AuthFn => async ( auth: Authentication ) => {
  if ( isEntraIdAuthentication ( auth ) ) getOrUpdateEntraId ( fetch, timeService, auth, tokenCache )
  if ( isApiKeyAuthentication ( auth ) ) return authForApiToken ( env, auth );
  if ( isBasicAuthentication ( auth ) ) return authForBasic ( env, auth );
  if ( isPrivateTokenAuthentication ( auth ) ) return authForPrivate ( env, auth )
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
  method?: 'Get' | 'Post' | 'Put' | 'Delete';
  headers?: NameAnd<string>;
  body?: string
}
export type FetchFn = ( url: string, options?: FetchFnOptions ) => Promise<FetchFnResponse>


export type IndexingContext = {
  authFn: AuthFn;
  timeService: Timeservice
  parentChildLogAndMetrics: IndexParentChildLogAndMetrics
  treeLogAndMetrics: IndexTreeLogAndMetrics
  forestLogAndMetrics: IndexForestLogAndMetrics
  fetch: FetchFn
}
export function defaultIndexingContext ( env: NameAnd<string>, fetch: FetchFn, metrics: NameAnd<number> ): IndexingContext {
  return {
    authFn: defaultAuthFn ( env, fetch, DateTimeService ),
    timeService: DateTimeService,
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
    timeService: DateTimeService,
    authFn: defaultAuthFn ( env, fetch, DateTimeService ),
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

export function nullAccessConfig<T> (): AccessConfig<T> {
  return {}
}

export async function access<T, L> ( ic: IndexingContext, details: SourceSinkDetails, offsetUrl: string, config: AccessConfig<L>, resfn?: ( response: FetchFnResponse ) => Promise<T> ): Promise<WithPaging<T, L>> {
  const { method, body, extraHeaders, pagingFn } = config;
  const fullUrl = offsetUrl.startsWith ( 'http' ) ? offsetUrl : details.baseurl + offsetUrl;
  try {
    const authHeaders = await ic.authFn ( details.auth )
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

    const json = resfn ? await resfn ( response ) : await response.json ();
    const page = pagingFn?. ( json, response.headers[ 'link' ] )
    const data = json;
    return { data: data, page }
  } catch ( e: any ) {
    console.error ( 'Error in access', method, fullUrl, e )
    throw e
  }
}
