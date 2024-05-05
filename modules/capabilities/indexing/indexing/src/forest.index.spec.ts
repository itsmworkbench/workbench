import { indexForestOfTrees, IndexForestTc, rememberForestLogsAndMetrics } from "./forest.index";

describe ( 'indexForest', () => {
  let logs: string[];
  let logAndMetrics;
  let tc: IndexForestTc<any>;

  // Simple side-effect-free implementations
  const fetchForest = async ( forestId: string ) => ({ id: forestId, trees: [ { id: "tree1" }, { id: "tree2" } ] });
  const treeIds = ( forest: any ) => forest.trees.map ( tree => tree.id );
  const processed: string[] = []
  const processTreeRoot = (forestId: string) => async ( id: string ) => { processed.push (`${forestId}-${id}`) };

  beforeEach ( () => {
    logs = [];
    logAndMetrics = rememberForestLogsAndMetrics ( logs );
    tc = { fetchForest, treeIds };
    processed.length = 0;
  } );

  test ( 'successful execution', async () => {
    await indexForestOfTrees ( logAndMetrics, tc, processTreeRoot ) ( 'forest123' );

    expect ( logs ).toEqual ( [
      "rootIds: tree1,tree2",
      "finished Root: forest123"
    ] );
    expect ( processed ).toEqual ( [ "forest123-tree1", "forest123-tree2" ] );
  } );

  test ( 'not found error', async () => {
    // Modify processTreeRoot to simulate 'Not Found' error
    const errorProcessTreeRoot = ( forestId: string ) =>async ( id: string ) => {
      throw new Error ( 'Not Found' );
    };

    await indexForestOfTrees ( logAndMetrics, tc, errorProcessTreeRoot ) ( 'forest123' );

    expect ( logs ).toEqual ( [
      "rootIds: tree1,tree2",
      "notfound Root: forest123"
    ] )
    expect ( processed ).toEqual ( [] );
  } );

  test ( 'general failure', async () => {
    const errorProcessTreeRoot = ( forestId: string ) => async ( id: string ) => {
      throw new Error ( 'Some error' );
    };

    await expect ( indexForestOfTrees ( logAndMetrics, tc, errorProcessTreeRoot ) ( 'forest123' ) ).rejects.toThrow ( 'Some error' );
    expect ( logs ).toEqual ( [
      "rootIds: tree1,tree2",
      "failed Root: forest123 Error: Some error"
    ] );
    expect ( processed ).toEqual ( [] );
  } );
} );
