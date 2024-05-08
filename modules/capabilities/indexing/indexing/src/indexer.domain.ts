export type WithPaging<T, P> = { data: T, page?: P }

export type Indexer<T> = {
  start: ( rootId: string ) => Promise<void>
  processLeaf: ( rootId: string, id: string ) => ( t: T ) => Promise<void>
  finished: ( id: string ) => Promise<void>
  failed: ( id: string, e: any ) => Promise<void>
}

export function indexerWithTransformer<T, T1> ( indexer: Indexer<T1>, fn: ( t: T ) => T1 ): Indexer<T> {
  return {
    start: indexer.start,
    processLeaf: ( rootId: string, id: string ) => async ( t: T ) => indexer.processLeaf ( rootId, id ) ( fn ( t ) ),
    finished: indexer.finished,
    failed: indexer.failed
  }
}
export const consoleIndexer: Indexer<any> = {
  start: async ( rootId: string ) => { console.log ( `Started: ${rootId}` ) },
  processLeaf: ( rootId, id: string ) => async ( t: any ) => { console.log ( `Processing: ${rootId} - ${id} - ${JSON.stringify ( t )}` ) },
  finished: async ( rootId: string ) => { console.log ( `Finished: ${rootId}` ) },
  failed: async ( rootId: string, e: any ) => { console.log ( `Failed: ${rootId} ${e}` ) }
}


export function rememberIndex<T> ( prefix: string, store: string[] ): Indexer<T> {
  return {
    start: async ( rootId: string ) => { store.push ( `Started: ${prefix} ${rootId}` ) },
    processLeaf: ( rootId: string, id: string ) => async ( t: T ) => { store.push ( `Processing: ${prefix} ${rootId} - ${id} - ${JSON.stringify ( t )}` ) },
    finished: async ( rootId: string ) => { store.push ( `Finished: ${prefix} ${rootId}` ) },
    failed: async ( rootId: string, e: any ) => { store.push ( `Failed: ${prefix} ${rootId} ${e}` ) }
  }
}
