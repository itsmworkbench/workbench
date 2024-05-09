import { IndexTreeLogAndMetrics, IndexTreeTc, processTreeRoot, rememberIndexTreeLogAndMetrics } from "./tree.index";
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
    await processTreeRoot ( logAndMetrics, treeIndexForTestTc, TestPageQueryPC, rememberIndexer, {} ) ( '/' );

    // Expect logs to reflect the correct processing order and content
    expect ( logs.sort() ).toEqual ( [
      "Started: test /",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "Processing: test / - onea - \"Prepared-/-onea\"",
      "Processing: test / - oneb - \"Prepared-/-oneb\"",
      "Finished Leaf: onea",
      "Finished Leaf: oneb",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "Processing: test / - onec - \"Prepared-/-onec\"",
      "Finished Leaf: onec",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "Processing: test / - oneaa - \"Prepared-/-oneaa\"",
      "Processing: test / - oneab - \"Prepared-/-oneab\"",
      "Finished Leaf: oneaa",
      "Finished Leaf: oneab",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "Processing: test / - oneac - \"Prepared-/-oneac\"",
      "Finished Leaf: oneac",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "Processing: test / - oneaaa - \"Prepared-/-oneaaa\"",
      "Processing: test / - oneaab - \"Prepared-/-oneaab\"",
      "Finished Leaf: oneaaa",
      "Finished Leaf: oneaab",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "Processing: test / - oneaac - \"Prepared-/-oneaac\"",
      "Processing: test / - oneaad - \"Prepared-/-oneaad\"",
      "Finished Leaf: oneaac",
      "Finished Leaf: oneaad",
      "LeafIds: Page: 3",
      "FolderIds: Page: 3",
      "Processing: test / - oneaae - \"Prepared-/-oneaae\"",
      "Finished Leaf: oneaae",
      "Finished Folder: a/aa",
      "LeafIds: Page: 3",
      "FolderIds: Page: 3",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "Processing: test / - oneaba - \"Prepared-/-oneaba\"",
      "Processing: test / - oneabb - \"Prepared-/-oneabb\"",
      "Processing: test / - oneaca - \"Prepared-/-oneaca\"",
      "Processing: test / - oneacb - \"Prepared-/-oneacb\"",
      "Finished Leaf: oneaba",
      "Finished Leaf: oneabb",
      "Finished Leaf: oneaca",
      "Finished Leaf: oneacb",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "Processing: test / - oneabc - \"Prepared-/-oneabc\"",
      "Processing: test / - oneacc - \"Prepared-/-oneacc\"",
      "Finished Leaf: oneabc",
      "Finished Leaf: oneacc",
      "Finished Folder: a/ab",
      "Finished Folder: a/ac",
      "Finished Folder: a",
      "LeafIds: Page: 3",
      "FolderIds: Page: 3",
      "LeafIds: Page: 1",
      "FolderIds: Page: 1",
      "Processing: test / - oneba - \"Prepared-/-oneba\"",
      "Processing: test / - onebb - \"Prepared-/-onebb\"",
      "Finished Leaf: oneba",
      "Finished Leaf: onebb",
      "LeafIds: Page: 2",
      "FolderIds: Page: 2",
      "Processing: test / - onebc - \"Prepared-/-onebc\"",
      "Finished Leaf: onebc",
      "Finished Folder: b",
      "Finished Folder: ",
      "Finished: test /"
    ].sort());
  } );
} );
