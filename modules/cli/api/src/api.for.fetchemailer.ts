import { KoaPartialFunction } from "@itsmworkbench/koa";
import { FetchEmailer } from "@itsmworkbench/fetchemail";

async function execute ( path: string, opts: any, fetcher: FetchEmailer ) {
  if ( path.endsWith ( '/test' ) ) return fetcher.testConnection ();
  if ( path.endsWith ( '/list' ) ) return fetcher.listEmails ( opts ); // just wrong
  if ( path.endsWith ( '/fetch' ) ) return fetcher.fetchEmail ( opts ); // but want to get going with test connection quickly
  throw new Error ( 'Unknown path: ' + path );
}
export const apiForFetchEmailer = ( fetcher: FetchEmailer ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/api\/fetchemail/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    return result;
  },
  apply: async ( ctx ) => {
    try {
      const body = JSON.parse ( ctx.context.request.rawBody );
      let path = ctx.context.request.path;
      const result = await execute ( path, body, fetcher );
      console.log ( 'Email: ', path, body, result )
      ctx.context.body = JSON.stringify ( result, null, 2 );
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
});