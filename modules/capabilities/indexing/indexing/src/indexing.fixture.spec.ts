import { indexForestTc, indexTestFolder, TestPageQueryPC, treeIndexForTestTc } from "./indexing.fixture";
import { indexForestOfTrees } from "./forest.index";

describe ( "test indexing fixture", () => {
  it ( "should return the correct folder root page 0", async () => {
    const forest = await indexForestTc.fetchForest ( '', TestPageQueryPC.zero () )
    expect ( forest.data ).toEqual ( {
      "folders": {},
      "leafs": [
        "onea",
        "oneb"
      ]
    } )
    expect ( forest.page ).toEqual ( {
      "maxCount": 5,
      "page": 1,
      "size": 2
    } )
  } )
  it ( "should return the correct folder root page 1", async () => {
    const forest = await indexForestTc.fetchForest ( '', { page: 1, size: 2, maxCount: 5 } )
    expect ( forest.data ).toEqual ( { folders: { a: indexTestFolder.folders.a }, leafs: [ 'onec' ] } )
  } )
  it ( "should return the correct folder root page 2", async () => {
    const forest = await indexForestTc.fetchForest ( '', { page: 2, size: 2, maxCount: 5 } )
    expect ( forest.data ).toEqual ( { folders: { b: indexTestFolder.folders.b }, leafs: [] } )
  } )
  it ( 'should prefix folder ids with the parent when indexing trees', async () => {
    const page = { ...TestPageQueryPC.zero (), size: 6 }
    const { data: forest } = await treeIndexForTestTc.fetchFolder ( 'someRoot', 'a', page )
    expect ( treeIndexForTestTc.folderIds ( 'someRoot', 'a', forest ) ).toEqual ( [
      "a/aa",
      "a/ab",
      "a/ac"
    ] )
  } )
} )