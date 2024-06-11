import { ContextAndStats, defaultShowsError, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { chainOfResponsibility } from "@itsmworkbench/utils";
import { NameAnd } from "@laoban/utils";
import { FetchFn, IndexTreeNonFunctionals } from "@itsmworkbench/indexing";
import { ApiKeyDetails, invalidateApiKeysForEmail, loadQueriesForEmail, makeApiKey, makeQueriesForUncontrolled } from "./apikey.for.dls";


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

export const healthZ = ( prefix: string ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    return ctx.context.request.path === `${prefix}/healthz`;
  },
  apply: async ( ctx ) => {
    ctx.context.status = 200;
  }
})
let rememberedError = ''
let errorCount = 0
let rememberedStackTrace = ''

export const getError: KoaPartialFunction = {
  isDefinedAt: ( ctx ) => {
    return ctx.context.request.path === '/apikey/error';
  },
  apply: async ( ctx ) => {
    ctx.context.status = 200;
    ctx.context.body = rememberedError + ' ' + errorCount + '\n' + rememberedStackTrace
  }
}

//Note there is only one secret and that it is optional
export const getapiKey = ( fetch: FetchFn, details: ApiKeyDetails, secretToUseApi?: string ): KoaPartialFunction => {
  return ({
    isDefinedAt: ( ctx: ContextAndStats ) => {
      return ctx.context.request.path.startsWith ( '/apikey/' )
    },
    apply: async ( ctx ) => {
      ctx.context.status = 200;
      const { elasticSearchUrl, index, headers } = details
      const email = decodeURIComponent ( ctx.context.request.path.substring ( 8 ) )
      const auth = ctx.context.request.headers.authorization
      if ( secretToUseApi && auth !== `Bearer ${secretToUseApi}` ) {
        ctx.context.status = 401;
        ctx.context.body = 'Unauthorized. Need a bearer token in the authorisation header'
        return
      }
      try {
        console.log ( 'delete', details.deletePrevious )
        if ( details.deletePrevious ) {
          console.log ( await invalidateApiKeysForEmail ( fetch, details ) ( email ) )
        }
        let { index, query } = await loadQueriesForEmail ( fetch, details, email );
        // if ( queries.bool.should.length === 0 ) {
        //   ctx.context.status = 403;
        //   ctx.context.body = `There are no indexes that have email ${email} in them. Indexes checked are ${index.join ( ',' )}`
        //   return
        // }
        const response = await makeApiKey ( fetch, details, email, query )
        ctx.context.body = JSON.stringify ( { ...response, indicies: index }, null, 2 )
        ctx.context.set ( 'Content-Type', 'application/json' );
      } catch ( e: any ) {
        rememberedError = JSON.stringify ( e )
        errorCount++
        if ( e instanceof Error ) {
          const stackTrace: string | undefined = e.stack;

          // Serialize the stack trace to a string (if needed)
          rememberedStackTrace = stackTrace ? JSON.stringify ( { stack: stackTrace }, null, 2 ) : '';

        }
        ctx.context.status = 500;
        ctx.context.body = e.toString ();
      }
    }
  })
}


export const metricIndexerHandlers = ( metrics: NameAnd<number>, nfcs: IndexTreeNonFunctionals[] ): (( from: ContextAndStats ) => Promise<void>) =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    healthZ ( '' ),
    getError,
    getMetrics ( metrics, nfcs ),
    notFoundIs404,
  )
export const apiKeyHandlers = ( fetch: FetchFn, apiKeyDetails: ApiKeyDetails, secret: string | undefined ): (( from: ContextAndStats ) => Promise<void>) =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    healthZ ( '/apikey' ),
    getError,
    getapiKey ( fetch, apiKeyDetails, secret ),
    notFoundIs404,
  )