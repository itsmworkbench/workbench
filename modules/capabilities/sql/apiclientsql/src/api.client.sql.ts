import { Sqler } from "@itsmworkbench/sql";

const call = async ( url: string, payload: any ) => {
  const response = await fetch ( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify ( payload )
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
  }
}