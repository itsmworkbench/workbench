import { ContextAndStats, defaultShowsError, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { chainOfResponsibility } from "@itsmworkbench/utils";
import { NameAnd } from "@laoban/utils";
import { IndexTreeNonFunctionals } from "@itsmworkbench/indexing";


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

export const indexerHandlers = ( metrics: NameAnd<number>, nfcs: IndexTreeNonFunctionals[] ): (( from: ContextAndStats ) => Promise<void>) =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    getMetrics ( metrics, nfcs ),
    notFoundIs404,
  )