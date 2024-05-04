export type Indexer<T> = {
  start: ( rootId: string ) => Promise<void>
  processLeaf: (  rootId: string ,id: string ) => ( t: T ) => Promise<void>
  finished: ( id: string ) => Promise<void>
  failed: ( id: string, e: any ) => Promise<void>
}

export const consoleIndexer: Indexer<any> = {
  start: async ( id: string ) => { console.log ( `Started: ${id}` ) },
  processLeaf: ( id: string ) => async ( t: any ) => { console.log ( `Processing: ${id} - ${JSON.stringify ( t )}` ) },
  finished: async ( id: string ) => { console.log ( `Finished: ${id}` ) },
  failed: async ( id: string, e: any ) => { console.log ( `Failed: ${id} ${e}` ) }
}

export function rememberIndex<T> ( store: string[] ): Indexer<T> {
  return {
    start: async ( id: string ) => { store.push ( `Started: ${id}` ) },
    processLeaf: ( id: string ) => async ( t: T ) => { store.push ( `Processing: ${id} - ${JSON.stringify ( t )}` ) },
    finished: async ( id: string ) => { store.push ( `Finished: ${id}` ) },
    failed: async ( id: string, e: any ) => { store.push ( `Failed: ${id} ${e}` ) }
  }
}
