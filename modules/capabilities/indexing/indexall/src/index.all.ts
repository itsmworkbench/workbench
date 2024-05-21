import { indexGitHubFully } from "@itsmworkbench/indexing_github";
import { indexJiraFully } from "@itsmworkbench/indexing_jira";
import { ExecuteIndexOptions, Indexer, IndexingContext, IndexTreeNonFunctionals } from "@itsmworkbench/indexing";
import { PopulatedIndexItem } from "@itsmworkbench/indexconfig";
import { NameAnd } from "@laoban/utils";
import { indexGitlabFully } from "@itsmworkbench/indexing_gitlab";
import { indexConfluenceSpaces } from "@itsmworkbench/indexing_confluence";

export function allIndexers ( nfc: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( nfc: IndexTreeNonFunctionals ) => ( fileTemplate: string, forestId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ): NameAnd<any> {
  return {
    github: indexGitHubFully ( nfc, ic, indexer ( nfc ), indexer ( nfc ), executeOptions ),
    gitlab: indexGitlabFully ( nfc, ic, indexer ( nfc ), indexer ( nfc ), executeOptions ),
    confluence: indexConfluenceSpaces ( ic, nfc, indexer ( nfc ), executeOptions ),
    jira: indexJiraFully ( nfc, ic, indexer ( nfc ), indexer ( nfc ), executeOptions ),
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
export const indexOneSource = ( context: IndexingContext, indexer: ( nfc: IndexTreeNonFunctionals ) => ( fileTemplate: string, indexId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) => ( item: PopulatedIndexItem, ): ResultAndNfc => {
  const { index, query, target, auth, scan, type } = item
  const nfc: IndexTreeNonFunctionals = {
    queryQueue: [],
    queryConcurrencyLimit: item.query.concurrencyLimit || 1000,
    queryThrottle: item.query.throttle,
    queryRetryPolicy: item.query.retry,
    indexThrottle: item.target.throttle,
    indexQueue: [],
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

export const indexAll = ( context: IndexingContext, indexer: ( nfc: IndexTreeNonFunctionals ) => ( fileTemplate: string, indexId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) =>
  ( items: NameAnd<PopulatedIndexItem> ): ResultAndNfc[] =>
    Object.values ( items ).map ( item =>
      indexOneSource ( context, indexer, executeOptions ) ( item ) )