import { fromEntries, NameAnd } from "@laoban/utils";
import { IndexForestTc } from "./forest.index";
import { WithPaging } from "./indexer.domain";
import { IndexTreeTc } from "./tree.index";
import { IndexParentChildTc } from "./index.parent.child";
import { PagingTc } from "./paging";

export type IndexTestFolder = {
  leafs: string[]
  folders?: NameAnd<IndexTestFolder>
}

export const indexTestFolder: IndexTestFolder = {
  "leafs": [ "onea", "oneb", "onec" ],
  folders: {
    a: {
      folders: {
        aa: {
          leafs: [ "oneaaa", "oneaab", "oneaac", "oneaad", "oneaae" ]
        },
        ab: {
          leafs: [ "oneaba", "oneabb", "oneabc" ]
        },
        ac: {
          leafs: [ "oneaca", "oneacb", "oneacc" ]
        }

      },
      leafs: [ "oneaa", "oneab", "oneac" ]
    },
    b: {
      leafs: [ "oneba", "onebb", "onebc" ]
    },
  }
}

export type TestPageQuery = { page: number, size: number, maxCount: number }

export const TestPageQueryPC: PagingTc<TestPageQuery> = {
  zero: () => ({ page: 0, size: 2, maxCount: 5 }),
  hasMore: ( page ) => (page.page) * page.size < page.maxCount,
  logMsg: ( page ) => `Page: ${page.page}`

}

export function getFromTestForest ( forest: IndexTestFolder, id: string ): IndexTestFolder {
  const parts = id.split ( '/' ).map ( x => x.trim () ).filter ( x => x.length > 0 )
  let f = forest
  for ( const p of parts ) {
    f = f.folders[ p ]
    if ( !f ) throw new Error ( `Not Found` )
  }
  return f
}

function forestAndPageToResult ( forest: IndexTestFolder, page: TestPageQuery ): WithPaging<IndexTestFolder, TestPageQuery> {
  const all = [ ...(forest.leafs), ...(Object.entries ( forest.folders || {} )) ];
  const inThisPage = all.slice ( page.page * page.size, page.page * page.size + page.size )
  page = { ...page, page: page.page + 1, maxCount: all.length }
  const theseFolders = inThisPage.filter ( x =>
    Array.isArray ( x ) ) as [ string, IndexTestFolder ][];
  const data = {
    folders: fromEntries ( ...theseFolders ),
    leafs: inThisPage.filter ( x => typeof x[ 1 ] === 'string' ) as string[]
  }
  return { data, page }
}
export const indexForestTc: IndexForestTc<IndexTestFolder, TestPageQuery> = {
  fetchForest: async ( forestId: string, page: TestPageQuery ): Promise<WithPaging<IndexTestFolder, TestPageQuery>> => {
    const forest = getFromTestForest ( indexTestFolder, forestId )
    return forestAndPageToResult ( forest, page );
  },
  treeIds: ( forest: IndexTestFolder ) => Object.keys ( forest.folders || {} )
}

export const treeIndexForTestTc: IndexTreeTc<IndexTestFolder, string, string, TestPageQuery> = {
  folderIds: ( rootId: string, parentId: string, folder: IndexTestFolder ) =>
    Object.keys ( folder.folders || {} ).map ( k =>
      parentId ? `${parentId}/${k}` : k ),
  leafIds: ( rootId: string, parentId: string, folder: IndexTestFolder ) => folder.leafs,
  fetchFolder: async ( rootId: string, folderId: string, page: TestPageQuery ) => {
    const folder = getFromTestForest ( indexTestFolder, folderId )
    return forestAndPageToResult ( folder, page )
  },
  fetchLeaf: async ( rootId: string, leafId: string ) => leafId,
  prepareLeaf: ( rootId: string ) => async ( leaf: string ) => `Prepared-${rootId}-${leaf}`
}

//TODO no paging yet
export const indexParentChildForestTc: IndexParentChildTc<IndexTestFolder, string> = {
  fetchParent: async ( rootId: string ) => indexTestFolder,
  children: ( rootId: string, parent: IndexTestFolder ) => Object.keys ( parent.folders || {} )

}
