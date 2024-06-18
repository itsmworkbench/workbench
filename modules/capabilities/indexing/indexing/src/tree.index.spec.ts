import { processTreeRoot, rememberIndexTreeLogAndMetrics } from "./tree.index";
import { rememberIndex } from "./indexer.domain";
import { TestPageQueryPC, treeIndexForTestTc } from "./indexing.fixture";


describe ( 'TreeIndexer Integration Test', () => {
  let logs: string[] = [];
  const logAndMetrics = rememberIndexTreeLogAndMetrics ( logs )
  const rememberIndexer = rememberIndex ( 'test', logs );

  beforeEach ( () => {
    logs.length = 0

  } );

  it ( 'should process a simple folder structure correctly', async () => {
    const indexer = processTreeRoot ( logAndMetrics, treeIndexForTestTc, TestPageQueryPC, rememberIndexer, {since:'1d'} );
    await indexer ( '/' );

    expect ( logs ).toEqual ( [
      "Started: test /",
      "LeafIds:onea,oneb -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent ",
      "Processing: test / - onea - \"Prepared-/-onea\"",
      "Processing: test / - oneb - \"Prepared-/-oneb\"",
      "Finished Leaf: onea",
      "Finished Leaf: oneb",
      "LeafIds:onec -- Page Page: 2",
      "FolderIds: [\"a\"] -- Page Page: 2, Parent ",
      "Processing: test / - onec - \"Prepared-/-onec\"",
      "Finished Leaf: onec",
      "LeafIds:oneaa,oneab -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent a",
      "Processing: test / - oneaa - \"Prepared-/-oneaa\"",
      "Processing: test / - oneab - \"Prepared-/-oneab\"",
      "Finished Leaf: oneaa",
      "Finished Leaf: oneab",
      "LeafIds:oneac -- Page Page: 2",
      "FolderIds: [\"a/aa\"] -- Page Page: 2, Parent a",
      "Processing: test / - oneac - \"Prepared-/-oneac\"",
      "Finished Leaf: oneac",
      "LeafIds:oneaaa,oneaab -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent a/aa",
      "Processing: test / - oneaaa - \"Prepared-/-oneaaa\"",
      "Processing: test / - oneaab - \"Prepared-/-oneaab\"",
      "Finished Leaf: oneaaa",
      "Finished Leaf: oneaab",
      "LeafIds:oneaac,oneaad -- Page Page: 2",
      "FolderIds: [] -- Page Page: 2, Parent a/aa",
      "Processing: test / - oneaac - \"Prepared-/-oneaac\"",
      "Processing: test / - oneaad - \"Prepared-/-oneaad\"",
      "Finished Leaf: oneaac",
      "Finished Leaf: oneaad",
      "LeafIds:oneaae -- Page Page: 3",
      "FolderIds: [] -- Page Page: 3, Parent a/aa",
      "Processing: test / - oneaae - \"Prepared-/-oneaae\"",
      "Finished Leaf: oneaae",
      "Finished Folder: a/aa",
      "LeafIds: -- Page Page: 3",
      "FolderIds: [\"a/ab\",\"a/ac\"] -- Page Page: 3, Parent a",
      "LeafIds:oneaba,oneabb -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent a/ab",
      "LeafIds:oneaca,oneacb -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent a/ac",
      "Processing: test / - oneaba - \"Prepared-/-oneaba\"",
      "Processing: test / - oneabb - \"Prepared-/-oneabb\"",
      "Processing: test / - oneaca - \"Prepared-/-oneaca\"",
      "Processing: test / - oneacb - \"Prepared-/-oneacb\"",
      "Finished Leaf: oneaba",
      "Finished Leaf: oneabb",
      "Finished Leaf: oneaca",
      "Finished Leaf: oneacb",
      "LeafIds:oneabc -- Page Page: 2",
      "FolderIds: [] -- Page Page: 2, Parent a/ab",
      "LeafIds:oneacc -- Page Page: 2",
      "FolderIds: [] -- Page Page: 2, Parent a/ac",
      "Processing: test / - oneabc - \"Prepared-/-oneabc\"",
      "Processing: test / - oneacc - \"Prepared-/-oneacc\"",
      "Finished Leaf: oneabc",
      "Finished Leaf: oneacc",
      "Finished Folder: a/ab",
      "Finished Folder: a/ac",
      "LeafIds: -- Page Page: 4",
      "FolderIds: [] -- Page Page: 4, Parent a",
      "Finished Folder: a",
      "LeafIds: -- Page Page: 3",
      "FolderIds: [\"b\"] -- Page Page: 3, Parent ",
      "LeafIds:oneba,onebb -- Page Page: 1",
      "FolderIds: [] -- Page Page: 1, Parent b",
      "Processing: test / - oneba - \"Prepared-/-oneba\"",
      "Processing: test / - onebb - \"Prepared-/-onebb\"",
      "Finished Leaf: oneba",
      "Finished Leaf: onebb",
      "LeafIds:onebc -- Page Page: 2",
      "FolderIds: [] -- Page Page: 2, Parent b",
      "Processing: test / - onebc - \"Prepared-/-onebc\"",
      "Finished Leaf: onebc",
      "Finished Folder: b",
      "Finished Folder: ",
      "Finished: test /"
    ]);
  } );
} );
