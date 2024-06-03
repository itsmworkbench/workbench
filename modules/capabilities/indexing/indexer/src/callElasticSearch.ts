import { FetchFn, FetchMethod } from "@itsmworkbench/indexing";
import { NameAnd } from "@laoban/utils";

export const callElasticSearch = ( fetch: FetchFn, headers: NameAnd<string>, method: FetchMethod, debug: boolean ) => async ( url: string, body?: any ) => {
  const response = await fetch ( url, {
    method,
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify ( body ) : undefined
  } );
  if ( response.ok ) {
    let json = await response.json ();
    if ( debug ) console.log ( JSON.stringify ( json ) )
    return json
  }
  throw new Error ( `Failed to call ${url}. ${response.status} ${response.statusText} ${await response.text ()}` )
};