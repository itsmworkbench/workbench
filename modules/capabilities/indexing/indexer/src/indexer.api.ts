import { ContextAndStats, defaultShowsError, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { chainOfResponsibility } from "@itsmworkbench/utils";
import { NameAnd } from "@laoban/utils";
import { FetchFn, IndexTreeNonFunctionals } from "@itsmworkbench/indexing";
import { ApiKeyDetails, invalidateApiKeysForEmail, loadQueriesForEmail, makeApiKey } from "./apikey.for.dls";


export const getMetrics = ( metrics: NameAnd<number>, nfcs: IndexTreeNonFunctionals[] ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx ) => {
      return ctx.context.request.path === '/metrics';
    },
    apply: async ( ctx ) => {
      ctx.context.status = 200;
      const nfc = nfcs.map ( n => ({
        queueConcurreny: n.queryQueue.length,
        queryConcurrencyLimit: n.queryConcurrencyLimit,
        queryThrottle: { max: n.queryThrottle.max, current: n.queryThrottle.current },
        indexConcurreny: n.indexQueue.length,
        indexerConcurrencyLimit: n.indexerConcurrencyLimit,
        indexThrottle: { max: n.indexThrottle.max, current: n.indexThrottle.current },
      }) )
      ctx.context.body = JSON.stringify ( { metrics, nfc }, null, 2 )
    }
  });

}

export const getapiKey = ( fetch: FetchFn, details: ApiKeyDetails ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx: ContextAndStats ) => {
      return ctx.context.request.path.startsWith ( '/apikey/' )
    },
    apply: async ( ctx ) => {
      ctx.context.status = 200;
      const { elasticSearchUrl, index, headers } = details
      const email = decodeURIComponent ( ctx.context.request.path.substring ( 8 ) )
      try {
        console.log('delete', details.deletePrevious)
        if ( details.deletePrevious ) {
          console.log ( await invalidateApiKeysForEmail ( fetch, details ) ( email ) )
        }
        const response = await makeApiKey ( fetch, details, email, await loadQueriesForEmail ( fetch, details, email ) )
        ctx.context.body = JSON.stringify ( response, null, 2 )
        ctx.context.set ( 'Content-Type', 'application/json' );
      } catch ( e ) {
        ctx.context.status = 500;
        ctx.context.body = e.toString ();
      }
    }
  })
}


export const metricIndexerHandlers = ( metrics: NameAnd<number>, nfcs: IndexTreeNonFunctionals[] ): (( from: ContextAndStats ) => Promise<void>) =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    getMetrics ( metrics, nfcs ),
    notFoundIs404,
  )
export const apiKeyHandlers = ( fetch: FetchFn, apiKeyDetails: ApiKeyDetails ): (( from: ContextAndStats ) => Promise<void>) =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    getapiKey ( fetch, apiKeyDetails ),
    notFoundIs404,
  )