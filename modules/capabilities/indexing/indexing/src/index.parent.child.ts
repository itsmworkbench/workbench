import { Indexer, } from "./indexer.domain";
import { ExecuteIndexOptions } from "./tree.index";
import { mapK, NameAnd } from "@laoban/utils";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { withConcurrencyLimit, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { PagingTc, WithPaging } from "./paging";

export type IndexParentChildLogAndMetrics = {
  parentId: ( parentId: string, page: string ) => void;
  finishedParent: ( parentId: string ) => void;
  notfoundParent: ( parentId: string ) => void;
  failedParent: ( parentId: string, e: any ) => void;
  children: <Child>( parentId: string, page: string, children: Child[], asString: ( c: Child ) => string ) => void;

}
export const nullIndexParentChildLogAndMetrics: IndexParentChildLogAndMetrics = {
  parentId: () => { },
  notfoundParent: () => { },
  finishedParent: () => { },
  failedParent: () => { },
  children: () => { }
}
export const consoleIndexParentChildLogAndMetrics: IndexParentChildLogAndMetrics = {
  parentId: ( parentId, page: string, ) => console.log ( `parentId: ${parentId} page: ${page}` ),
  notfoundParent: ( parentId ) => console.log ( `notfoundParent: ${parentId}` ),
  finishedParent: ( parentId ) => console.log ( `finishedParent: ${parentId}` ),
  failedParent: ( parentId, e ) => console.log ( `failedParent: ${parentId} ${e}` ),
  children: ( parentId, page, children, asString ) => console.log ( `children: ${parentId}, page: ${page}, ${children.map ( asString )}` )
}
export function defaultIndexParentChildLogAndMetrics ( metrics: NameAnd<number>, delegate: IndexParentChildLogAndMetrics ): IndexParentChildLogAndMetrics {
  function inc ( name: string ) {
    if ( !metrics[ name ] ) metrics[ name ] = 0
    metrics[ name ]++
  }
  return {
    parentId: ( parentId, page: string ) => {
      delegate.parentId ( parentId, page )
      inc ( 'parentId' )
    },
    finishedParent: ( parentId ) => {
      delegate.finishedParent ( parentId )
      inc ( 'finishedParent' )
    },
    notfoundParent: ( parentId ) => {
      delegate.notfoundParent ( parentId )
      inc ( 'notfoundParent' )
    },
    failedParent: ( parentId, e ) => {
      delegate.failedParent ( parentId, e )
      inc ( 'failedParent' )
    },
    children: ( parentId, page, children, asString ) => {
      delegate.children ( parentId, page, children, asString )
      inc ( 'children' )

    }
  }
}
export const rememberIndexParentChildLogsAndMetrics = ( msgs: string[] ): IndexParentChildLogAndMetrics => {
  return {
    parentId: ( parentId, page ) => msgs.push ( `parentId: ${parentId}, page: ${page}` ),
    finishedParent: ( parentId ) => msgs.push ( `finishedParent: ${parentId}` ),
    failedParent: ( parentId, e ) => msgs.push ( `failedParent: ${parentId} ${e}` ),
    notfoundParent: ( parentId ) => msgs.push ( `notfoundParent: ${parentId}` ),
    children: ( parentId, page, children, asString ) => msgs.push ( `parent: ${parentId}, page: ${page}, children: ${children.map ( asString ).join ( ',' )}` )
  }
}

export type IndexParentChildTc<Parent, Child, Page> = {
  fetchParent: ( parentId: string, page: Page ) => Promise<WithPaging<Parent, Page>>;
  children: ( parentId: string, parent: Parent ) => Child[];
}

export function addNonFunctionalsToIndexParentChildTc<Parent, Child, Page> ( nf: IndexTreeNonFunctionals, tc: IndexParentChildTc<Parent, Child, Page> ): IndexParentChildTc<Parent, Child, Page> {
  return {
    fetchParent: withRetry ( nf.queryRetryPolicy, withConcurrencyLimit ( nf.queryConcurrencyLimit, nf.queryQueue, withThrottle ( nf.queryThrottle, tc.fetchParent ) ) ),
    children: ( parentId, parent ) => tc.children ( parentId, parent )
  }
}
export function indexParentChild<Parent, Child, IndexedChild, Page> ( logAndMetrics: IndexParentChildLogAndMetrics,
                                                                      tc: IndexParentChildTc<Parent, Child, Page>,
                                                                      pc: PagingTc<Page>,
                                                                      transformer: ( t: Child ) => Promise<IndexedChild>,
                                                                      childId: ( parentId: string, c: Child ) => string,
                                                                      executeOptions: ExecuteIndexOptions ) {
  return ( indexer: Indexer<IndexedChild> ) => async ( parentId: string ) => {
    try {
      indexer.start ( parentId );
      let page = pc.zero ();
      do {
        const pageLogMsg = pc.logMsg ( page );
        logAndMetrics.parentId ( parentId, pageLogMsg );
        const pageAndData = await tc.fetchParent ( parentId, page );
        const parent = pageAndData.data;
        page = pageAndData.page;
        const children = tc.children ( parentId, parent );
        if ( executeOptions.dryRunJustShowTrees !== true && executeOptions.dryRunDoEverythingButIndex !== true ) {
          await mapK ( children, async child =>
            indexer.processLeaf ( parentId, childId ( parentId, child ) ) ( await transformer ( child ) ) );
        }
        logAndMetrics.children ( parentId, pageLogMsg, children, c => childId ( parentId, c ) );
      } while ( pc.hasMore ( page ) );
      indexer.finished ( parentId );
      logAndMetrics.finishedParent ( parentId );
    } catch ( e: any ) {
      indexer.failed ( parentId, e );
      if ( e.message === 'Not Found' ) {
        logAndMetrics.notfoundParent ( parentId );
      } else {
        logAndMetrics.failedParent ( parentId, e );
        throw e;
      }
    }
  };
}