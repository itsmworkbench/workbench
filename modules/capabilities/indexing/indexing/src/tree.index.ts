import { Task, withConcurrencyLimit } from "@itsmworkbench/kleislis/src/concurrency.limiter";
import { stopThrottling, withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { mapK } from "@laoban/utils";
import { Indexer } from "./indexer.domain";

export type IndexTreeTc<Folder, Leaf, IndexedLeaf> = {
  folderIds: ( rootId: string, parentId: string | undefined, f: Folder ) => string[];
  leafIds: ( rootId: string, parentId: string | undefined, f: Folder ) => string[];
  fetchFolder: ( rootId: string, folderId: string ) => Promise<Folder>,
  fetchLeaf: ( rootId: string, leafId: string ) => Promise<Leaf>;  // Function to fetch leaf data
  prepareLeaf: ( rootId: string ) => ( leaf: Leaf ) => Promise<IndexedLeaf>;    // Function to prepare leaf for indexing
}


export function addNonFunctionalsToIndexTreeTC<Folder, Leaf, IndexedLeaf> ( nf: IndexTreeNonFunctionals, tc: IndexTreeTc<Folder, Leaf, IndexedLeaf> ): IndexTreeTc<Folder, Leaf, IndexedLeaf> {
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
  const queue: Task<any>[] = []
  const { indexerConcurrencyLimit, queryThrottle, queryRetryPolicy, indexThrottle, prepareLeafRetryPolicy, indexRetryPolicy } = nf;
  return {
    start: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, queue, withThrottle ( queryThrottle, indexer.start ) ) ),
    processLeaf: ( rootId, id: string ) => withRetry ( prepareLeafRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, queue, indexer.processLeaf ( rootId, id ) ) ),
    finished: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, queue, withThrottle ( queryThrottle, indexer.finished ) ) ),
    failed: withRetry ( queryRetryPolicy, withConcurrencyLimit ( indexerConcurrencyLimit, queue, withThrottle ( queryThrottle, indexer.failed ) ) ),
  }
}
export function stopNonFunctionals ( nft: IndexTreeNonFunctionals ) {
  stopThrottling ( nft.queryThrottle )
  stopThrottling ( nft.indexThrottle )
}


export type IndexTreeLogAndMetrics = {
  leafIds: ( ids: string[] ) => void;
  folderIds: ( ids: string[] ) => void;
  finishedLeaf: ( id: string ) => void;
  failedLeaf: ( id: string, e: any ) => void;
  finishedFolder: ( id: string ) => void;
}

export const nullIndexTreeLogAndMetrics: IndexTreeLogAndMetrics = {
  leafIds: () => { },
  folderIds: () => { },
  finishedLeaf: () => { },
  failedLeaf: () => { },
  finishedFolder: () => { }
}
export const consoleIndexTreeLogAndMetrics: IndexTreeLogAndMetrics = {
  leafIds: ( ids ) => console.log ( `LeafIds: ${ids}` ),
  folderIds: ( ids ) => console.log ( `FolderIds: ${ids}` ),
  finishedLeaf: ( id ) => console.log ( `Finished Leaf: ${id}` ),
  failedLeaf: ( id, e ) => console.log ( `Failed Leaf: ${id} ${e}` ),
  finishedFolder: ( id ) => console.log ( `Finished Folder: ${id}` )
}
export function rememberIndexTreeLogAndMetrics ( msgs: string[] ): IndexTreeLogAndMetrics {
  return {
    leafIds: ( ids ) => msgs.push ( `LeafIds: ${ids}` ),
    folderIds: ( ids ) => msgs.push ( `FolderIds: ${ids}` ),
    finishedLeaf: ( id ) => msgs.push ( `Finished Leaf: ${id}` ),
    failedLeaf: ( id, e ) => msgs.push ( `Failed Leaf: ${id} ${e}` ),
    finishedFolder: ( id ) => msgs.push ( `Finished Folder: ${id}` )
  }
}

export type ExecuteIndexOptions = {
  dryRunJustShowRepo?: boolean;
  dryRunDoEverythingButIndex?: boolean;
}

export type ProcessTreeRoot = <Folder, Leaf, IndexedLeaf> ( logAndMetrics: IndexTreeLogAndMetrics, tc: IndexTreeTc<Folder, Leaf, IndexedLeaf>, indexer: Indexer<IndexedLeaf>, options: ExecuteIndexOptions ) => ( rootId: string ) => Promise<void>;
export function processTreeRoot<Folder, Leaf, IndexedLeaf> ( logAndMetrics: IndexTreeLogAndMetrics, tc: IndexTreeTc<Folder, Leaf, IndexedLeaf>, indexer: Indexer<IndexedLeaf>, options: ExecuteIndexOptions ) {
  async function processFolder ( rootId: string, folderId: string, parentId?: string ): Promise<void> {
    const folder = await tc.fetchFolder ( rootId, folderId );
    const leafIds = tc.leafIds ( rootId, parentId, folder );
    logAndMetrics.leafIds ( leafIds );
    const folderIds = tc.folderIds ( rootId, parentId, folder );
    logAndMetrics.folderIds ( folderIds );
    await mapK ( leafIds, leafId => processLeaf ( rootId, leafId ) );
    await mapK ( folderIds, child => processFolder ( rootId, child, folderId ) );
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
      if ( options.dryRunJustShowRepo !== true )
        await processFolder ( rootId, '' );
      await indexer.finished ( rootId );
    } catch ( e ) {
      await indexer.failed ( rootId, e );
    }
  }
}
