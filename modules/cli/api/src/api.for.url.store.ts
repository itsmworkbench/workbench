import { ListNamesOrder, UrlListFn, UrlLoadFn, UrlSaveFn } from "@itsmworkbench/url";
import { KoaPartialFunction } from "@runbook/koa";
import { ErrorsAnd, hasErrors } from "@laoban/utils";

export function handleUrls<Res> ( methodType: string, actionFn: ( url: string, requestBody: string ) => Promise<ErrorsAnd<Res>> ): KoaPartialFunction {
  return {
    isDefinedAt: ( ctx ) => {
      const match = /\/url\/([^\/]+)/.exec ( ctx.context.request.path );
      const isMethodMatch = ctx.context.request.method === methodType;
      return match && isMethodMatch;
    },
    apply: async ( ctx ) => {
      const match = /\/url\/([^\/]+)/.exec ( ctx.context.request.path );
      const url = match[ 1 ];
      try {
        console.log ( `${methodType}Urls`, url );
        // The actionFn is either 'load' for GET or 'save' for PUT
        const result: ErrorsAnd<Res> = await actionFn ( url, ctx.context.request.body )
        if ( hasErrors ( result ) ) {
          ctx.context.status = 500;
          ctx.context.body = result.join ( '\n' );
          return;
        }
        ctx.context.body = JSON.stringify ( result );
        ctx.context.set ( 'Content-Type', 'application/json' );
      } catch ( e ) {
        ctx.context.status = 404;
        ctx.context.body = e.toString ();
      }
    }
  };
}

export const getUrls = ( load: UrlLoadFn ): KoaPartialFunction => handleUrls ( 'GET', load );
export const putUrls = ( save: UrlSaveFn ): KoaPartialFunction => handleUrls ( 'PUT', save );

const listUrlRegex = /^\/url\/list\/([^\/]+)\/([^\/]+)$/;


const getOrder = ( order: string | undefined ): ListNamesOrder => {
  if ( order === undefined ) return 'name'
  if ( order === '' ) return 'name'
  if ( order === 'date' ) return 'date'
  if ( order === 'name' ) return 'name'
  throw new Error ( `Invalid order parameter: ${order}. Must be 'name' or 'date'.` );
};

const getIntegerWithDefault = ( value, defaultValue ) => {
  const parsed = parseInt ( value, 10 );
  return isNaN ( parsed ) || parsed < 1 ? defaultValue : parsed;
};

// Extracting from ctx.query and applying defaults


// Now pageSize, page, and order have either the values from the query params or the defaults

export const listUrls = ( list: UrlListFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = listUrlRegex.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'GET';
    return match && isMethodMatch;
  },
  apply: async ( ctx ) => {
    const match = listUrlRegex.exec ( ctx.context.request.path );
    if ( match ) {
      const org = match[ 1 ];
      const ns = match[ 2 ];
      try {
        const pageSize = getIntegerWithDefault ( ctx.context.query.pageSize, 10 );
        const page = getIntegerWithDefault ( ctx.context.query.page, 1 );
        const order = getOrder ( ctx.context.query.order );

        const result = await list ( org, ns, { page, pageSize }, order )
        if ( hasErrors ( result ) ) {
          console.log('listUrls - errors', result)
          ctx.context.status = 500;
          ctx.context.body = result.join ( '\n' );
          return;
        }
        ctx.context.body = JSON.stringify ( result );
        ctx.context.set ( 'Content-Type', 'application/json' );
      } catch ( e ) {
        ctx.context.status = 404;
        ctx.context.body = e.toString ();
      }
    } else {
      ctx.context.status = 501;
      ctx.context.body = `didn't match regex ${listUrlRegex} with ${ctx.context.request.path}`
    }
  }
});

