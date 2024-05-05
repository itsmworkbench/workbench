import { indexGitHubFully, indexGitHubRepo } from "@itsmworkbench/indexing_github";
import { consoleIndexTreeLogAndMetrics, defaultIndexTreeNfs, ExecuteIndexOptions, Indexer, IndexingContext, IndexTreeNonFunctionals, insertIntoFileWithNonFunctionals, queryThrottlePrototype, stopNonFunctionals } from "@itsmworkbench/indexing";
import { consoleIndexForestLogAndMetrics } from "@itsmworkbench/indexing/src/forest.index";
import { PopulatedIndexItem } from "@itsmworkbench/indexconfig";
import { NameAnd } from "@laoban/utils";

export function allIndexers ( nfc: IndexTreeNonFunctionals, ic: IndexingContext, indexer: (nfc: IndexTreeNonFunctionals) =>( forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ): NameAnd<any> {
  return {
    github: indexGitHubFully ( nfc, ic, indexer(nfc), indexer(nfc), executeOptions )
  };
}
//export type IndexTreeNonFunctionals = {
//   queryConcurrencyLimit: number;
//   queryThrottle: Throttling;
//   queryRetryPolicy: RetryPolicyConfig;
//   indexThrottle: Throttling;
//   prepareLeafRetryPolicy: RetryPolicyConfig;
//   indexRetryPolicy: RetryPolicyConfig;
//   indexerConcurrencyLimit: number;
// }
export type ResultAndNfc = {
  result: Promise<any>;
  nfc: IndexTreeNonFunctionals;

}
export const indexOneSource = ( context: IndexingContext, indexer: (nfc: IndexTreeNonFunctionals) =>( forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) => ( item: PopulatedIndexItem, ): ResultAndNfc => {
  const { index, query, target, auth, scan, type } = item
  const nfc: IndexTreeNonFunctionals = {
    queryConcurrencyLimit: item.query.concurrencyLimit || 1000,
    queryThrottle: item.query.throttle,
    queryRetryPolicy: item.query.retry,
    indexThrottle: item.target.throttle,
    prepareLeafRetryPolicy: item.target.retry,
    indexRetryPolicy: item.target.retry,
    indexerConcurrencyLimit: item.target.concurrencyLimit
  }
  const all = allIndexers ( nfc, context, indexer, executeOptions );
  const thisIndexer = all [ type ]
  if ( thisIndexer === undefined ) throw new Error ( `No indexer for ${type}. Legal values are ${Object.keys ( all ).sort ()}` )
  const result = thisIndexer ( item.scan )
  return { result, nfc }
};

export const indexAll = ( context: IndexingContext, indexer:(nfc: IndexTreeNonFunctionals) => ( forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) =>
  ( items: NameAnd<PopulatedIndexItem> ): ResultAndNfc[] =>
    Object.values ( items ).map ( indexOneSource ( context, indexer, executeOptions ) )