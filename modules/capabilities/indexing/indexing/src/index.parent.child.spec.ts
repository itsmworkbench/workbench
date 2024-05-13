import { indexParentChild, rememberIndexParentChildLogsAndMetrics } from "./index.parent.child";
import { indexParentChildForTestTc, IndexTestFolder, TestPageQuery, TestPageQueryPC, treeIndexForTestTc } from "./indexing.fixture";
import { rememberIndex } from "./indexer.domain";

describe ( "Index parent child", () => {
  it ( "should index the test fixture - root", async () => {
    const logs: string[] = []
    let remembered: string[] = [];
    const indexer = indexParentChild<IndexTestFolder, string, string, TestPageQuery> (
      rememberIndexParentChildLogsAndMetrics ( logs ),
      indexParentChildForTestTc,
      TestPageQueryPC,
      async t => t + "_indexed",
      ( p, c ) => `${p}${c}`,
      {}
    ) ( rememberIndex ( "test", remembered ) )

    await indexer ( '/' )
    expect ( logs ).toEqual ( [
      "parentId: /, page: Page: 0",
      "parent: /, page: Page: 0, children: /onea,/oneb",
      "parentId: /, page: Page: 1",
      "parent: /, page: Page: 1, children: /a,/onec",
      "parentId: /, page: Page: 2",
      "parent: /, page: Page: 2, children: /b",
      "finishedParent: /"
    ])
    expect ( remembered ).toEqual ( [
      "Started: test /",
      "Processing: test / - /onea - \"onea_indexed\"",
      "Processing: test / - /oneb - \"oneb_indexed\"",
      "Processing: test / - /a - \"a_indexed\"",
      "Processing: test / - /onec - \"onec_indexed\"",
      "Processing: test / - /b - \"b_indexed\"",
      "Finished: test /"
    ])
  } )
  it ( "should index the test fixture - deeper", async () => {
    const logs: string[] = []
    let remembered: string[] = [];
    const indexer = indexParentChild<IndexTestFolder, string, string, TestPageQuery> (
      rememberIndexParentChildLogsAndMetrics ( logs ),
      indexParentChildForTestTc,
      TestPageQueryPC,
      async t => t + "_indexed",
      ( p, c ) => `${p}/${c}`,
      {}
    ) ( rememberIndex ( "test", remembered ) )

    await indexer ( '/a/aa' )
    expect ( logs ).toEqual ( [
      "parentId: /a/aa, page: Page: 0",
      "parent: /a/aa, page: Page: 0, children: /a/aa/oneaaa,/a/aa/oneaab",
      "parentId: /a/aa, page: Page: 1",
      "parent: /a/aa, page: Page: 1, children: /a/aa/oneaac,/a/aa/oneaad",
      "parentId: /a/aa, page: Page: 2",
      "parent: /a/aa, page: Page: 2, children: /a/aa/oneaae",
      "finishedParent: /a/aa"
    ] )
    expect ( remembered ).toEqual ( [
      "Started: test /a/aa",
      "Processing: test /a/aa - /a/aa/oneaaa - \"oneaaa_indexed\"",
      "Processing: test /a/aa - /a/aa/oneaab - \"oneaab_indexed\"",
      "Processing: test /a/aa - /a/aa/oneaac - \"oneaac_indexed\"",
      "Processing: test /a/aa - /a/aa/oneaad - \"oneaad_indexed\"",
      "Processing: test /a/aa - /a/aa/oneaae - \"oneaae_indexed\"",
      "Finished: test /a/aa"
    ])
  } )
} )
