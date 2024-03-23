import { Sqler } from "@itsmworkbench/sql";

const call = async ( url: string, payload: any ) => {
  const response = await fetch ( url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify ( payload )
  } );
  return response.json ();
};
export function apiClientSql ( url: string ): Sqler {
  return {
    query: ( sql, env ) => call ( url + '/query', { sql, env } ),
    update: ( sql, env ) => call ( url + '/update', { sql, env } ),
    test: ( env ) => call ( url + '/test', { env } ),
  }
}