import { KoaPartialFunction } from "@itsmworkbench/koa";
import { Sqler, SqlQueryResult } from "@itsmworkbench/sql";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { Mailer } from "@itsmworkbench/mailer";

async function processSql ( path: string, json: any, sqler: Sqler ): Promise<ErrorsAnd<string | number | SqlQueryResult>> {
  if ( path.endsWith ( '/query' ) ) return await sqler.query ( json.sql, json.env );
  if ( path.endsWith ( '/update' ) ) return await sqler.update ( json.sql, json.env );
  if ( path.endsWith ( '/test' ) ) return await sqler.test ( json.env );
  throw new Error ( `Invalid path ${path}` );
}
function responseToString ( result: string[] | string | number | SqlQueryResult ) {
  if ( typeof result === "string" ) return result
  if ( Array.isArray ( result ) ) return result.join ( '\n' )
  return JSON.stringify ( result, null, 2 );
}

export const apiForSqler = ( sqler: Sqler, debug?: boolean ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/api\/sql/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    return result;
  },
  apply: async ( ctx ) => {
    const json = JSON.parse ( ctx.context.request.rawBody );
    console.log ( 'Json for sql', json )
    try {
      const result: ErrorsAnd<string | number | SqlQueryResult> = await processSql ( ctx.context.request.path, json, sqler,  );
      console.log ( 'Sql: result', typeof result, result )
      let resultString = responseToString ( result );
      ctx.context.body = resultString;
      console.log('Sql: resultString', resultString)
      ctx.context.set ( 'Content-Type', typeof result === 'string' ? 'text/plain' : 'application/json' );
      if ( hasErrors ( result ) ) ctx.context.status = 400;
    } catch ( e ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})