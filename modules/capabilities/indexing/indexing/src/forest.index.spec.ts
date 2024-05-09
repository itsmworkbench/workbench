import { indexForestOfTrees, rememberForestLogsAndMetrics } from "./forest.index";
import { indexForestTc, TestPageQueryPC } from "./indexing.fixture";

describe ( 'indexForestOfTrees function', () => {
  it ( 'processes all pages of a forest and handles pagination correctly', async () => {
    const logs = [];
    const logAndMetrics = rememberForestLogsAndMetrics ( logs );
    const remembered: string[] = []
    const processTreeRoot = ( forestId: string ) => async ( id: string ) => {remembered.push ( `[${forestId}]-${id}` )}

    const indexForest = indexForestOfTrees ( logAndMetrics, indexForestTc, TestPageQueryPC, processTreeRoot );

    // Execute the function with the root of the forest
    await indexForest ( '' );

    expect ( logs ).toEqual ( [
      "rootIds: Page: 0 - ",
      "rootIds: Page: 1 - a",
      "rootIds: Page: 2 - b",
      "finished Root: "
    ] );
    expect ( remembered ).toEqual ( [
      "[]-a",
      "[]-b"
    ] );


  } );

  it ( 'handles "Not Found" errors correctly when the forest does not exist', async () => {
    const logs = [];
    const logAndMetrics = rememberForestLogsAndMetrics ( logs );
    const processTreeRoot = jest.fn ().mockResolvedValue ( undefined );

    const indexForest = indexForestOfTrees ( logAndMetrics, indexForestTc, TestPageQueryPC, processTreeRoot );

    // Simulate fetching a non-existent forest

    await indexForest ( 'nonexistent' );
    expect ( logs ).toEqual ( [
      "notfound Root: nonexistent"
    ]);
  } );
} );
