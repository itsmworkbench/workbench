import { mapK, NameAnd } from "@laoban/utils";
import { K1, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { Task, withConcurrencyLimit } from "@itsmworkbench/kleislis/src/concurrency.limiter";
import { Indexer, WithPaging } from "./indexer.domain";
import { ExecuteIndexOptions } from "./tree.index";
import { PagingTc } from "./paging";


export interface IndexForestTc<Forest, Paging> {
  fetchForest: ( forestId: string, paging: Paging ) => Promise<WithPaging<Forest, Paging>>;
  treeIds: ( forest: Forest ) => string[];
}

export function addNonFunctionalsToIndexForestTc<Forest, Paging> ( nf: IndexTreeNonFunctionals, tc: IndexForestTc<Forest, Paging> ): IndexForestTc<Forest, Paging> {
  const { queryConcurrencyLimit, queryThrottle, queryRetryPolicy,queryQueue } = nf;
  return {
    fetchForest: withRetry ( queryRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queryQueue, withThrottle ( queryThrottle, tc.fetchForest ) ) ),
    treeIds: tc.treeIds,
  }
}
export interface IndexForestLogAndMetrics {
  rootIds: ( page: string, ids: string[] ) => void;
  finishedRoot: ( id: string ) => void;
  notfoundRoot: ( id: string ) => void;
  failedRoot: ( id: string, e: any ) => void;
}
export const consoleIndexForestLogAndMetrics: IndexForestLogAndMetrics = {
  rootIds: ( page, ids ) => console.log ( 'rootIds', page, ids ),
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
export function defaultForestLogAndMetrics ( metrics: NameAnd<number>, logAndMetrics: IndexForestLogAndMetrics ): IndexForestLogAndMetrics {

  function inc ( name: string ) {
    if ( !metrics[ name ] ) metrics[ name ] = 0
    metrics[ name ]++
  }

  return {
    rootIds: ( page, ids ) => {
      logAndMetrics.rootIds ( page, ids )
      inc ( 'rootIds' )
    },
    finishedRoot: ( id ) => {
      logAndMetrics.finishedRoot ( id )
      inc ( 'finishedRoot' )
    },
    notfoundRoot: ( id ) => {
      logAndMetrics.notfoundRoot ( id )
      inc ( 'notfoundRoot' )
    },
    failedRoot: ( id, e ) => {
      logAndMetrics.failedRoot ( id, e )
      inc ( 'failedRoot' )
    }
  }
}

export function rememberForestLogsAndMetrics ( msgs: string[] ): IndexForestLogAndMetrics {
  return {
    rootIds: ( page: string, ids: string[] ) => msgs.push ( `rootIds: ${page} - ${ids}` ),
    finishedRoot: ( id: string ) => msgs.push ( `finished Root: ${id}` ),
    failedRoot: ( id: string, e: any ) =>
      msgs.push ( `failed Root: ${id} ${e}` ),
    notfoundRoot: ( id: string ) => msgs.push ( `notfound Root: ${id}` )
  }
}

export function indexForestOfTrees<Forest, Page> ( logAndMetrics: IndexForestLogAndMetrics,
                                                   tc: IndexForestTc<Forest, Page>,
                                                   paging: PagingTc<Page>, //the string is the treeId
                                                   processTreeRoot: ( forestId: string ) => K1<string, void> ) {
  return async ( forestId: string ) => {
    try {
      let page = paging.zero ()
      do {
        const logMsg = paging.logMsg ( page );
        const pageAndData = await tc.fetchForest ( forestId, page );
        page = pageAndData.page
        const forest = pageAndData.data;
        const treeIds = tc.treeIds ( forest );
        logAndMetrics.rootIds ( logMsg, treeIds );
        await mapK ( treeIds, processTreeRoot ( forestId ) )
      } while ( paging.hasMore ( page ) )
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
