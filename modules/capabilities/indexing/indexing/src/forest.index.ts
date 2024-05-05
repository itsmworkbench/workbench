import { mapK } from "@laoban/utils";
import { K1, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { Task, withConcurrencyLimit } from "@itsmworkbench/kleislis/src/concurrency.limiter";
import { Indexer } from "./indexer.domain";
import { ExecuteIndexOptions } from "./tree.index";


export interface IndexForestTc<Forest> {
  fetchForest: ( forestId: string ) => Promise<Forest>;
  treeIds: ( forest: Forest ) => string[];
}

export function addNonFunctionalsToIndexForestTc<Forest, Tree> ( nf: IndexTreeNonFunctionals, tc: IndexForestTc<Forest> ): IndexForestTc<Forest> {
  const { queryConcurrencyLimit, queryThrottle, queryRetryPolicy } = nf;
  const queue: Task<any>[] = []
  return {
    fetchForest: withRetry ( queryRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queue, withThrottle ( queryThrottle, tc.fetchForest ) ) ),
    treeIds: tc.treeIds
  }
}
export interface IndexForestLogAndMetrics {
  rootIds: ( ids: string[] ) => void;
  finishedRoot: ( id: string ) => void;
  notfoundRoot: ( id: string ) => void;
  failedRoot: ( id: string, e: any ) => void;
}
export const consoleIndexForestLogAndMetrics: IndexForestLogAndMetrics = {
  rootIds: ( ids ) => console.log ( 'rootIds', ids ),
  finishedRoot: ( id ) => console.log ( 'finishedRoot', id ),
  notfoundRoot: ( id ) => console.log ( 'notfoundRoot', id ),
  failedRoot: ( id, e ) => console.log ( 'failedRoot', id, e )
}
export const nullIndexForestLogAndMetrics: IndexForestLogAndMetrics = {
  rootIds: () => { },
  notfoundRoot: () => { },
  finishedRoot: () => { },
  failedRoot: () => { }
}
export function rememberForestLogsAndMetrics ( msgs: string[] ): IndexForestLogAndMetrics {
  return {
    rootIds: ( ids: string[] ) => msgs.push ( `rootIds: ${ids}` ),
    finishedRoot: ( id: string ) => msgs.push ( `finished Root: ${id}` ),
    failedRoot: ( id: string, e: any ) =>
      msgs.push ( `failed Root: ${id} ${e}` ),
    notfoundRoot: ( id: string ) => msgs.push ( `notfound Root: ${id}` )
  }
}

export function indexForestOfTrees<Forest> ( logAndMetrics: IndexForestLogAndMetrics,
                                             tc: IndexForestTc<Forest>, //the string is the treeId
                                             processTreeRoot: ( forestId: string ) => K1<string, void> ) {
  return async ( forestId: string ) => {
    try {
      const forest = await tc.fetchForest ( forestId );
      const treeIds = tc.treeIds ( forest );
      logAndMetrics.rootIds ( treeIds );
      await mapK ( treeIds, processTreeRoot ( forestId ) )
      logAndMetrics.finishedRoot ( forestId )
    } catch ( e: any ) {
      if ( e.message === 'Not Found' )
        logAndMetrics.notfoundRoot ( forestId );
      else {
        logAndMetrics.failedRoot ( forestId, e );
        throw e
      }
    }
  }
}
