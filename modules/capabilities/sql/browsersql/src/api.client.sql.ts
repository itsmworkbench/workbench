import { Sqler } from "@itsmworkbench/sql";

const call = async ( url: string, payload: any, method: string = 'POST' ) => {
  const response = await fetch ( url, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
    body: method === 'GET' ? undefined : JSON.stringify ( payload )
  } );
  let result = await (response.status < 400 && response.headers.get ( 'content-type' ) === 'application/json' ? response.json () : response.text ());
  console.log ( 'apiClientSqler', result )
  return result;
};
export function apiClientSqler ( url: string ): Sqler {
  return {
    query: ( sql, env ) => call ( url + '/query', { sql, env } ),
    update: ( sql, env ) => call ( url + '/update', { sql, env } ),
    test: ( env ) => call ( url + '/test', { env } ),
    listEnvs: () => call ( url + '/envs', {} ) // OK could be a get but that's more work
  }
}