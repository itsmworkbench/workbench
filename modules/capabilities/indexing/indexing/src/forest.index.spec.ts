// Updated SimplePaging to include maxCount
import { indexForestOfTrees, IndexForestTc, rememberForestLogsAndMetrics } from "./forest.index";
import { PagingTc } from "./paging";
import { WithPaging } from "./indexer.domain";

interface TestForest {
  data: string[];
  page: SimplePaging;
}
interface SimplePaging {
  page: number;
  pageSize: number;
  maxCount: number;  // Total number of items, used to control paging
}

// Function to create an initial TestForest
function makeForest ( count: number ): TestForest {
  return {
    data: Array.from ( { length: count }, ( _, i ) => `tree${i + 1}` ),
    page: { page: 0, pageSize: 2, maxCount: count }
  };
}

// Adjusted Typeclass implementation for SimplePaging with maxCount
const simplePagingTc: PagingTc<SimplePaging> = {
  zero: () => ({ page: 0, pageSize: 2, maxCount: 5 }),  // Ensure maxCount is correct or passed dynamically if needed
  hasMore: ( p: SimplePaging ) => {
    const pageStart = (p.page) * p.pageSize;
    return pageStart < p.maxCount;
  },
  logMsg: ( p: SimplePaging ) => `Page ${p.page}`,
};

// Updated IndexForestTc to use the TestForest structure initialized by makeForest
const testIndexForestTc: IndexForestTc<TestForest, SimplePaging> = {
  fetchForest: async ( forestId, page ) => {
    const start = page.page * page.pageSize;
    const end = start + page.pageSize;
    const allData = makeForest ( page.maxCount ).data;  // Use makeForest to get all data
    const result: WithPaging<TestForest, SimplePaging> = {
      data: { page, data: allData.slice ( start, end ) },
      page,
    };
    return result;
  },
  nextPage: ( forest ) => ({ ...forest.page, page: forest.page.page + 1 }),
  treeIds: ( forest ) => forest.data,
};

describe ( 'indexForestOfTrees', () => {
  it ( 'indexes all trees across multiple pages using makeForest', async () => {
    let logs: string[] = [];
    const testLogAndMetrics = rememberForestLogsAndMetrics ( logs );
    const processed: string[] = [];
    const processTreeRoot = ( forestId: string ) => async ( treeId: string ) => {
      processed.push ( `Processed ${forestId} ${treeId}` );
    };

    // Initialize the function with a specific forest count
    simplePagingTc.zero = () => ({ page: 0, pageSize: 2, maxCount: 5 });  // Adjust zero to ensure correct maxCount
    const initialForest = makeForest ( 5 );  // Create an initial forest with 5 trees

    const indexFunction = indexForestOfTrees ( testLogAndMetrics, testIndexForestTc, simplePagingTc, processTreeRoot );

    await indexFunction ( "testForest" );

    expect ( processed ).toEqual ( [
      'Processed testForest tree1', 'Processed testForest tree2',
      'Processed testForest tree3', 'Processed testForest tree4',
      'Processed testForest tree5'
    ] );
    expect ( logs ).toEqual ( [
      'rootIds: Page 0 - tree1,tree2',
      'rootIds: Page 1 - tree3,tree4',
      'rootIds: Page 2 - tree5',
      'finished Root: testForest'
    ] );
  } );
  it ( 'handles a page size larger than the data count', async () => {
    let logs: string[] = [];
    const testLogAndMetrics = rememberForestLogsAndMetrics ( logs );
    const processed: string[] = [];
    const processTreeRoot = ( forestId: string ) => async ( treeId: string ) => {
      processed.push ( `Processed ${forestId} ${treeId}` );
    };

    // Initialize the function with a large page size
    simplePagingTc.zero = () => ({ page: 0, pageSize: 10, maxCount: 5 });  // Page size exceeds data count
    const initialForest = makeForest ( 5 );  // Create an initial forest with 5 trees

    const indexFunction = indexForestOfTrees ( testLogAndMetrics, testIndexForestTc, simplePagingTc, processTreeRoot );

    await indexFunction ( "testForest" );

    expect ( processed ).toEqual ( [
      'Processed testForest tree1', 'Processed testForest tree2',
      'Processed testForest tree3', 'Processed testForest tree4',
      'Processed testForest tree5'
    ] );
    expect ( logs ).toEqual ( [
      'rootIds: Page 0 - tree1,tree2,tree3,tree4,tree5',
      'finished Root: testForest'
    ] );
  } );
  it ( 'handles a no data scenario', async () => {
    let logs: string[] = [];
    const testLogAndMetrics = rememberForestLogsAndMetrics ( logs );
    const processed: string[] = [];
    const processTreeRoot = ( forestId: string ) => async ( treeId: string ) => {
      processed.push ( `Processed ${forestId} ${treeId}` );
    };

    // Initialize the function with zero data
    simplePagingTc.zero = () => ({ page: 0, pageSize: 10, maxCount: 0 });  // No data available
    const initialForest = makeForest ( 0 );  // Create an initial forest with 0 trees

    const indexFunction = indexForestOfTrees ( testLogAndMetrics, testIndexForestTc, simplePagingTc, processTreeRoot );

    await indexFunction ( "testForest" );

    expect ( processed ).toEqual ( [] );  // No processing should happen
    expect ( logs ).toEqual ( [
      "rootIds: Page 0 - ", //do we want this? It's not wrong... so not sure
      "finished Root: testForest"
    ] );  // Should log that processing is finished despite no data
  } );

} );
