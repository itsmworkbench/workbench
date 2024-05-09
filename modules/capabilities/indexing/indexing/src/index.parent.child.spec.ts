import { indexParentChild, rememberIndexParentChildLogsAndMetrics } from "./index.parent.child";
import { indexParentChildForestTc, IndexTestFolder, TestPageQuery, TestPageQueryPC, treeIndexForTestTc } from "./indexing.fixture";
import { rememberIndex } from "./indexer.domain";

describe ( "Index parent child", () => {
  it ( "should index the test fixture",async  () => {
    const logs: string[] = []
    let remembered: string[] = [];
    const indexer = indexParentChild<IndexTestFolder, string, string, TestPageQuery> (
      rememberIndexParentChildLogsAndMetrics ( logs ),
      indexParentChildForestTc,
      TestPageQueryPC,
      t => t + "_indexed",
      rememberIndex ( "test", remembered ),
      ( p, c ) => `${p}/${c}`,
      {}
    )
    await indexer('/')
    expect(remembered).toEqual([
      "Started: test /",
      "Processing: test / - //a - \"a_indexed\"",
      "Processing: test / - //b - \"b_indexed\"",
      "Finished: test /"
    ])
    expect(logs).toEqual([
      "parentId: /",
      "finishedParent: /"
    ])
  } )
} )
