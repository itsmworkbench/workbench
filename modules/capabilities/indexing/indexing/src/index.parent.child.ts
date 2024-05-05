import { Indexer } from "./indexer.domain";
import { ExecuteIndexOptions } from "./tree.index";
import { mapK } from "@laoban/utils";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { withConcurrencyLimit } from "@itsmworkbench/kleislis/src/concurrency.limiter";

export type IndexParentChildLogAndMetrics = {
  parentId: ( parentId: string ) => void;
  finishedParent: ( parentId: string ) => void;
  notfoundParent: ( parentId: string ) => void;
  failedParent: ( parentId: string, e: any ) => void;
  children: <Child>( parentId: string, children: Child[], asString: ( c: Child ) => string ) => void;

}
export const nullIndexParentChildLogAndMetrics: IndexParentChildLogAndMetrics = {
  parentId: () => { },
  notfoundParent: () => { },
  finishedParent: () => { },
  failedParent: () => { },
  children: () => { }
}
export const consoleIndexParentChildLogAndMetrics: IndexParentChildLogAndMetrics = {
  parentId: ( parentId ) => console.log ( `parentId: ${parentId}` ),
  notfoundParent: ( parentId ) => console.log ( `notfoundParent: ${parentId}` ),
  finishedParent: ( parentId ) => console.log ( `finishedParent: ${parentId}` ),
  failedParent: ( parentId, e ) => console.log ( `failedParent: ${parentId} ${e}` ),
  children: ( parentId, children, asString ) => console.log ( `children: ${parentId} ${children.map ( asString )}` )
}
export const rememberIndexParentChildLogsAndMetrics = ( msgs: string[] ): IndexParentChildLogAndMetrics => {
  return {
    parentId: ( parentId ) => msgs.push ( `parentId: ${parentId}` ),
    finishedParent: ( parentId ) => msgs.push ( `finishedParent: ${parentId}` ),
    failedParent: ( parentId, e ) => msgs.push ( `failedParent: ${parentId} ${e}` ),
    notfoundParent: ( parentId ) => msgs.push ( `notfoundParent: ${parentId}` ),
    children: ( parentId, children, asString ) => msgs.push ( `children: ${parentId} ${children.map ( asString )}` )
  }
}

export type IndexParentChildTc<Parent, Child> = {
  fetchParent: ( parentId: string ) => Promise<Parent>;
  children: ( parentId: string, parent: Parent ) => Child[];
}

export function addNonFunctionalsToIndexParentChildTc<Parent, Child> ( nf: IndexTreeNonFunctionals, tc: IndexParentChildTc<Parent, Child> ): IndexParentChildTc<Parent, Child> {
  return {
    fetchParent: withRetry ( nf.queryRetryPolicy, withConcurrencyLimit ( nf.queryConcurrencyLimit, [], withThrottle ( nf.queryThrottle, tc.fetchParent ) ) ),
    children: ( parentId, parent ) => tc.children ( parentId, parent )

  }

}
export function indexParentChild<Parent, Child, IndexedChild> ( logAndMetrics: IndexParentChildLogAndMetrics,
                                                                tc: IndexParentChildTc<Parent, Child>,
                                                                transformer: ( t: Child ) => IndexedChild,
                                                                findIndexer: ( parentId: string ) => Indexer<IndexedChild>,
                                                                executeOptions: ExecuteIndexOptions ) {
  return async ( parentId: string ) => {
    const indexer = findIndexer ( parentId );
    try {
      indexer.start ( parentId );
      logAndMetrics.parentId ( parentId );
      const parent = await tc.fetchParent ( parentId );
      const children = tc.children ( parentId, parent );
      if ( executeOptions.dryRunJustShowTrees !== true && executeOptions.dryRunDoEverythingButIndex !== true ) {
        await mapK ( children, child => indexer.processLeaf ( parentId, parentId ) ( transformer ( child ) ) );
      }
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