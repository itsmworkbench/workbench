import { mapK, NameAnd } from "@laoban/utils";
import { K1, withConcurrencyLimit, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { WithPaging } from "./indexer.domain";
import { PagingTc } from "./paging";


export interface IndexForestTc<Forest, Tree, Paging> {
  fetchForest: ( forestId: string, paging: Paging ) => Promise<WithPaging<Forest, Paging>>;
  treeIds: ( forest: Forest ) => Tree[];
  treeToString?: ( tree: Tree ) => string;
}

export function addNonFunctionalsToIndexForestTc<Forest, Tree, Paging> ( nf: IndexTreeNonFunctionals, tc: IndexForestTc<Forest, Tree, Paging> ): IndexForestTc<Forest, Tree, Paging> {
  const { queryConcurrencyLimit, queryThrottle, queryRetryPolicy, queryQueue } = nf;
  return {
    fetchForest: withRetry ( queryRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queryQueue, withThrottle ( queryThrottle, tc.fetchForest ) ) ),
    treeIds: tc.treeIds,
    treeToString: tc.treeToString
  }
}
export interface IndexForestLogAndMetrics {
  trees: ( page: string, trees: string[] ) => void;
  finishedRoot: ( id: string ) => void;
  notfoundRoot: ( id: string ) => void;
  failedRoot: ( id: string, e: any ) => void;
}
export const consoleIndexForestLogAndMetrics: IndexForestLogAndMetrics = {
  trees: ( page, trees ) => console.log ( 'rootIds', page, trees ),
  finishedRoot: ( id ) => console.log ( 'finishedRoot', id ),
  notfoundRoot: ( id ) => console.log ( 'notfoundRoot', id ),
  failedRoot: ( id, e ) => console.log ( 'failedRoot', id, e )
}
export const nullIndexForestLogAndMetrics: IndexForestLogAndMetrics = {
  trees: () => { },
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
    trees: ( page, ids ) => {
      logAndMetrics.trees ( page, ids )
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
    trees: ( page: string, ids: string[] ) => msgs.push ( `rootIds: ${page} - ${ids}` ),
    finishedRoot: ( id: string ) => msgs.push ( `finished Root: ${id}` ),
    failedRoot: ( id: string, e: any ) =>
      msgs.push ( `failed Root: ${id} ${e}` ),
    notfoundRoot: ( id: string ) => msgs.push ( `notfound Root: ${id}` )
  }
}

export function indexForestOfTrees<Forest, Tree, Page> ( logAndMetrics: IndexForestLogAndMetrics,
                                                         tc: IndexForestTc<Forest, Tree, Page>,
                                                         paging: PagingTc<Page>, //the string is the treeId
                                                         processTreeRoot: ( forestId: string ) => K1<Tree, void> ) {
  return async ( forestId: string ) => {
    try {
      let page = paging.zero ()
      do {
        const logMsg = paging.logMsg ( page );
        const pageAndData = await tc.fetchForest ( forestId, page );
        page = pageAndData.page
        const forest = pageAndData.data;
        const trees = tc.treeIds ( forest );
        logAndMetrics.trees ( logMsg, trees.map ( tc.treeToString ? tc.treeToString : s => s.toString () ) );
        await mapK ( trees, processTreeRoot ( forestId ) )
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
