import { IndexTreeLogAndMetrics, IndexTreeTc, processTreeRoot } from "./tree.index";
import { Indexer } from "./index.domain";
import { mapK } from "@laoban/utils";
import { K1 } from "@itsmworkbench/kleislis";


export interface ForestIndexTc<Forest, Folder, Leaf, IndexedLeaf> extends IndexTreeTc<any, any, any> {
  fetchForest: ( forestId: string ) => Promise<Forest>;
  treeIds: ( forest: Forest ) => string[];
}

export interface IndexForestLogAndMetrics extends IndexTreeLogAndMetrics {
  rootIds: ( ids: string[] ) => void;
  finishedRoot: ( id: string ) => void;
  failedRoot: ( id: string, e: any ) => void;

}

export  function indexForest<Forest,Folder, Leaf, IndexedLeaf> ( logAndMetrics: IndexTreeLogAndMetrics,
                                                                 tc: ForestIndexTc<Forest,Folder, Leaf, IndexedLeaf>,
                                                                 processTreeRoot: K1<string, void>) {
  return async (forestId: string) => {
    const forest = await tc.fetchForest(forestId);
    const treeIds = tc.treeIds(forest);
    await mapK(treeIds, processTreeRoot)
  }
}