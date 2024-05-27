import { Indexer, SourceSinkDetails } from "@itsmworkbench/indexing";

export interface ConfluenceAclDetails extends SourceSinkDetails {
  file: string
  index: string
}

export const indexConfluenceAcl = ( indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any> ) => async ( details: ConfluenceAclDetails ) => {
  const indexer: Indexer<any> = indexerFn ( details.file, details.index )
  await indexer.start ( details.index )
  try {
    await indexer.finished ( details.index )
  } catch ( e ) {
    await indexer.failed ( details.index, e )
  }
};