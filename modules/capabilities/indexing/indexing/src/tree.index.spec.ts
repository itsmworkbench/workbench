import { IndexTreeLogAndMetrics, IndexTreeTc, processTreeRoot } from "./tree.index";
import { rememberIndex } from "./indexer.domain";


describe ( 'TreeIndexer Integration Test', () => {
  let logs: string[] = [];
  let fetchTC: IndexTreeTc<any, any, any>;
  const logAndMetrics: IndexTreeLogAndMetrics = {
    leafIds: ( ids ) => logs.push ( `LeafIDs-${ids.join ( ',' )}` ),
    folderIds: ( ids ) => logs.push ( `FolderIDs-${ids.join ( ',' )}` ),
    finishedLeaf: ( id ) => logs.push ( `FinishedLeaf-${id}` ),
    failedLeaf: ( id ) => logs.push ( `FailedLeaf-${id}` ),
    finishedFolder: ( id ) => logs.push ( `FinishedFolder-${id}` )
  };
  const rememberIndexer = rememberIndex ( logs );

  beforeEach ( () => {
    logs.length = 0

    fetchTC = {
      folderIds: ( rootId: string, p: string, folder ) => folder.subfolders,
      leafIds: ( rootId: string, p: string, folder ) => folder.leaves,
      fetchFolder: ( rootId: string, folderId ) => Promise.resolve ( {
        id: folderId,
        subfolders: folderId === '' ? [ 'subfolder1' ] : [],
        leaves: folderId === '' ? [ 'leaf1', 'leaf2' ] : [ 'leaf3' ]
      } ),
      fetchLeaf: ( rootId: string, leafId ) => Promise.resolve ( { id: leafId } ),
      prepareLeaf: ( rootId: string ) => ( leaf ) => Promise.resolve ( `Prepared-${rootId}-${leaf.id}` ),
    };


    // Modify fetchFolder to return a structured folder with subfolders and leaves


  } );

  it ( 'should process a simple folder structure correctly', async () => {
    await processTreeRoot ( logAndMetrics, fetchTC, rememberIndexer ) ( 'root' );

    // Expect logs to reflect the correct processing order and content
    expect ( logs ).toEqual ( [
      "Started: root",
      "LeafIDs-leaf1,leaf2",
      "FolderIDs-subfolder1",
      "Processing: root - leaf1 - \"Prepared-root-leaf1\"",
      "Processing: root - leaf2 - \"Prepared-root-leaf2\"",
      "FinishedLeaf-leaf1",
      "FinishedLeaf-leaf2",
      "LeafIDs-leaf3",
      "FolderIDs-",
      "Processing: root - leaf3 - \"Prepared-root-leaf3\"",
      "FinishedLeaf-leaf3",
      "FinishedFolder-subfolder1",
      "FinishedFolder-",
      "Finished: root"
    ]);
  } );
} );
