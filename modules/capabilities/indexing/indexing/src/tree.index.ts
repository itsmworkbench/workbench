import { K3, stopThrottling, Task, withConcurrencyLimit, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { mapK, NameAnd } from "@laoban/utils";
import { Indexer } from "./indexer.domain";
import { PagingTc, WithPaging } from "./paging";

export type IndexTreeTc<Folder, Leaf, IndexedLeaf, Paging> = {
  folderIds: ( rootId: string, parentId: string | undefined, f: Folder ) => string[];
  leafIds: ( rootId: string, parentId: string | undefined, f: Folder ) => string[];
  fetchFolder: ( rootId: string, folderId: string, page: Paging ) => Promise<WithPaging<Folder, Paging>>,
  fetchLeaf: ( rootId: string, leafId: string ) => Promise<Leaf>;
  prepareLeaf: ( rootId: string ) => ( leaf: Leaf ) => Promise<IndexedLeaf>;    // Function to prepare leaf for indexing
}


export function addNonFunctionalsToIndexTreeTC<Folder, Leaf, IndexedLeaf, Paging> (
  nf: IndexTreeNonFunctionals,
  tc: IndexTreeTc<Folder, Leaf, IndexedLeaf, Paging> ): IndexTreeTc<Folder, Leaf, IndexedLeaf, Paging> {
  const queue: Task<any>[] = []
  const { queryConcurrencyLimit, queryThrottle, queryRetryPolicy, indexThrottle, prepareLeafRetryPolicy, indexRetryPolicy } = nf;
  return {
    folderIds: tc.folderIds,
    leafIds: tc.leafIds,
    fetchFolder: withRetry ( queryRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queue, withThrottle ( queryThrottle, tc.fetchFolder ) ) ),
    fetchLeaf: withRetry ( queryRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queue, withThrottle ( queryThrottle, tc.fetchLeaf ) ) ),
    prepareLeaf: rootId => withRetry ( prepareLeafRetryPolicy, withConcurrencyLimit ( queryConcurrencyLimit, queue, tc.prepareLeaf ( rootId ) ) )
  }
}


export function addNonFunctionsToIndexer<T> ( nf: IndexTreeNonFunctionals, indexer: Indexer<T> ): Indexer<T> {

  const { indexerConcurrencyLimit, queryThrottle, queryRetryPolicy, indexThrottle, prepareLeafRetryPolicy, indexRetryPolicy, queryQueue, indexQueue } = nf;
  return {
    start: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, queryQueue, withThrottle ( queryThrottle, indexer.start ) ) ),
    processLeaf: ( rootId, id: string ) => withRetry ( prepareLeafRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, indexQueue, indexer.processLeaf ( rootId, id ) ) ),
    finished: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, indexQueue, withThrottle ( queryThrottle, indexer.finished ) ) ),
    failed: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, indexQueue, withThrottle ( queryThrottle, indexer.failed ) ) ),
  }
}
export function stopNonFunctionals ( nft: IndexTreeNonFunctionals ) {
  stopThrottling ( nft.queryThrottle )
  stopThrottling ( nft.indexThrottle )
}


export type IndexTreeLogAndMetrics = {
  leafIds: ( page: string, ids: string[] ) => void;
  folderIds: ( page: string, parentId: string | undefined, ids: string[] ) => void;
  finishedLeaf: ( id: string ) => void;
  failedLeaf: ( id: string, e: any ) => void;
  finishedFolder: ( id: string ) => void;
  failedFetch ( id: string, page: any, e: any ): void;
}

export const nullIndexTreeLogAndMetrics: IndexTreeLogAndMetrics = {
  leafIds: () => { },
  folderIds: () => { },
  finishedLeaf: () => { },
  failedLeaf: () => { },
  finishedFolder: () => { },
  failedFetch: () => { }
}
export const consoleIndexTreeLogAndMetrics: IndexTreeLogAndMetrics = {
  leafIds: ( ids ) => console.log ( `LeafIds: ${ids}` ),
  folderIds: ( ids ) => console.log ( `FolderIds: ${ids}` ),
  finishedLeaf: ( id ) => console.log ( `Finished Leaf: ${id}` ),
  failedLeaf: ( id, e ) => console.log ( `Failed Leaf: ${id} ${e}` ),
  finishedFolder: ( id ) => console.log ( `Finished Folder: ${id}` ),
  failedFetch: ( id, page, e ) => console.log ( `Failed Fetch: ${id} ${JSON.stringify ( page )} ${JSON.stringify ( e )}` )
}
export function defaultTreeLogAndMetrics ( metrics: NameAnd<number>, logAndMetrics: IndexTreeLogAndMetrics ): IndexTreeLogAndMetrics {
  function inc ( name: string ) {
    if ( !metrics[ name ] ) metrics[ name ] = 0
    metrics[ name ]++
  }
  return {
    leafIds: ( page, ids ) => {
      logAndMetrics.leafIds ( page, ids )
      inc ( 'leafIds' )
    },
    folderIds: ( page, parent, ids ) => {
      logAndMetrics.folderIds ( page, parent, ids )
      inc ( 'folderIds' )
    },
    finishedLeaf: ( id ) => {
      logAndMetrics.finishedLeaf ( id )
      inc ( 'finishedLeaf' )
    },
    failedLeaf: ( id, e ) => {
      logAndMetrics.failedLeaf ( id, e )
      inc ( 'failedLeaf' )
    },
    failedFetch: ( id, page, e ) => {
      logAndMetrics.failedFetch ( id, page, e )
      inc ( 'failedFetch' )
    },
    finishedFolder: ( id ) => {
      logAndMetrics.finishedFolder ( id )
      inc ( 'finishedFolder' )

    }
  }
}

export function rememberIndexTreeLogAndMetrics ( msgs: string[] ): IndexTreeLogAndMetrics {
  return {
    leafIds: ( page, ids ) => msgs.push ( `LeafIds:${ids} -- Page ${page}` ),
    folderIds: ( page, parent, ids ) => msgs.push ( `FolderIds: ${JSON.stringify ( ids )} -- Page ${page}, Parent ${parent}` ),
    finishedLeaf: ( id ) => msgs.push ( `Finished Leaf: ${id}` ),
    failedLeaf: ( id, e ) => msgs.push ( `Failed Leaf: ${id} ${e}` ),
    finishedFolder: ( id ) => msgs.push ( `Finished Folder: ${id}` ),
    failedFetch: ( id, e ) => msgs.push ( `Failed Fetch: ${id} ${JSON.stringify ( e )}` )
  }
}

export type ExecuteIndexOptions = {
  dryRunJustShowTrees?: boolean;
  dryRunDoEverythingButIndex?: boolean;
  since: string
  indicies?:string[]
}

export type ProcessTreeRoot = <Folder, Leaf, IndexedLeaf, Paging> ( logAndMetrics: IndexTreeLogAndMetrics, tc: IndexTreeTc<Folder, Leaf, IndexedLeaf, Paging>, indexer: Indexer<IndexedLeaf>, options: ExecuteIndexOptions ) => ( rootId: string ) => Promise<void>;
export function processTreeRoot<Folder, Leaf, IndexedLeaf, Paging> ( logAndMetrics: IndexTreeLogAndMetrics,
                                                                     tc: IndexTreeTc<Folder, Leaf, IndexedLeaf, Paging>,
                                                                     pc: PagingTc<Paging>,
                                                                     indexer: Indexer<IndexedLeaf>,
                                                                     options: ExecuteIndexOptions ) {
  async function processFolder ( rootId: string, folderId: string, parentId?: string ): Promise<void> {
    let page = pc.zero ();
    async function fetchData () {
      try {
        return await tc.fetchFolder ( rootId, folderId, page );
      } catch ( e ) {
        logAndMetrics.failedFetch ( folderId, page, e );
        throw e;
      }
    }
    do {
      const folderAndPaging = await fetchData ();
      const folder = folderAndPaging.data;
      page = folderAndPaging.page;
      const leafIds = tc.leafIds ( rootId, folderId, folder );
      const pageMsg = pc.logMsg ( page );
      logAndMetrics.leafIds ( pageMsg, leafIds );
      const folderIds = tc.folderIds ( rootId, folderId, folder );
      logAndMetrics.folderIds ( pageMsg, folderId, folderIds );
      await mapK ( leafIds, leafId => processLeaf ( rootId, leafId ) );
      await mapK ( folderIds, child => processFolder ( rootId, child, folderId ) );
    } while ( pc.hasMore ( page ) )
    logAndMetrics.finishedFolder ( folderId );
  }
  async function processLeaf ( rootId: string, leafId: string ): Promise<void> {
    try {
      const leaf = await tc.fetchLeaf ( rootId, leafId );
      const preparedLeaf = await tc.prepareLeaf ( rootId ) ( leaf );
      if ( options.dryRunDoEverythingButIndex !== true )
        await indexer.processLeaf ( rootId, leafId ) ( preparedLeaf );
      logAndMetrics.finishedLeaf ( leafId );
    } catch ( error ) {
      logAndMetrics.failedLeaf ( leafId, `${error}` );
      throw error
    }
  }
  return async ( rootId: string ): Promise<void> => {
    if ( !logAndMetrics )
      throw new Error ( 'logAndMetrics is required' );
    await indexer.start ( rootId );
    try {
      if ( options.dryRunJustShowTrees !== true )
        await processFolder ( rootId, '' );
      await indexer.finished ( rootId );
    } catch ( e ) {
      await indexer.failed ( rootId, e );
    }
  }
}
