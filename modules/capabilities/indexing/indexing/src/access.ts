import { Throttling } from "@itsmworkbench/kleislis";
import { NameAnd } from "@laoban/utils";
import { IndexTreeLogAndMetrics } from "./tree.index";

export type TokenAuthentication= {
  token: string
}

export type SourceSinkDetails = {
  baseurl: string;
  authentication: string; //actually
}
export type AuthFn = ( details: SourceSinkDetails ) => Promise<NameAnd<string>>

export type FetchFn = ( url: RequestInfo, options?: RequestInit ) => Promise<Response>

export type IndexingContext = {
  authFn: AuthFn;
  logAndMetrics: IndexTreeLogAndMetrics
  fetch: FetchFn
}
export async function access ( ic: IndexingContext, details: SourceSinkDetails, offsetUrl, method?, body?: any, extraHeaders?: NameAnd<string> ) {
  const token = await ic.authFn ( details )
  const fullUrl = details.baseurl + offsetUrl;
  const headers = { ...token, ...(extraHeaders || {}) };
  const response = await ic.fetch ( fullUrl, {
    method: method||'GET',
    headers: headers,
    body: body
  } );
  if (response.status===404) throw Error('Not Found')
  if ( !response.ok )
    throw new Error ( `Error fetching ${fullUrl}: ${response.statusText}` )
  const result = await response.json ();
  return result
}
