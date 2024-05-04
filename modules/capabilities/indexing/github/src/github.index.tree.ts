import { access, addNonFunctionalsToIndexTreeTC, Indexer, IndexingContext, IndexTreeLogAndMetrics, IndexTreeTc, processTreeRoot, SourceSinkDetails } from "@itsmworkbench/indexing";
import { IndexTreeNonFunctionals } from "@itsmworkbench/indexing/src/indexing.non.functionals";

export type GitHubFile = {
  name: string;
  path: string;
  type: 'file'
  url: string
  html_url: string
  content: string;
  encoding: 'base64'
}
export type GitHubDir = {
  name: string;
  path: string;
  type: 'dir'
}
export type GitHHubDirOrFile = GitHubFile | GitHubDir
export type GitHubFolder = GitHHubDirOrFile[]

export function fileToIndexFile ( file: GitHubFile ): GithubIndexedFile {
  return {
    name: file.name,
    path: file.path,
    url: file.url,
    html_url: file.html_url,
    content: Buffer.from ( file.content, 'base64' ).toString ( 'utf-8' )
  }
}

export type GithubIndexedFile = {
  name: string;
  path: string;
  url: string
  html_url: string
  content: string;
}


export function githubTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexTreeTc<GitHubFolder, GitHubFile, GithubIndexedFile> {
  return addNonFunctionalsToIndexTreeTC ( nf, {
    folderIds: ( rootId, p, f ) => f.filter ( x => x.type === 'dir' ).map ( x => x.path ),
    leafIds: ( rootId, p, f ) => f.filter ( x => x.type === 'file' && x.path.endsWith ( '.md' ) ).map ( x => x.path ),
    fetchFolder: ( rootId, folderId ) =>
      access ( ic, githubDetails, `/repos/${rootId}/contents/${folderId}` ),
    fetchLeaf: ( rootId, leafId ) => access ( ic, githubDetails, `/repos/${rootId}/contents/${leafId}` ),
    prepareLeaf: ( rootId ) => async ( leaf ) => fileToIndexFile ( leaf )
  } )
}


export const logAndMetrics: IndexTreeLogAndMetrics = null

const token = process.env.GITHUB_TOKEN;
if ( token === null || token == undefined ) {
  throw new Error ( 'GITHUB_TOKEN not set in environment' )
}

export const githubDetails: SourceSinkDetails = {
  baseurl: "https://api.github.com",
  authentication: 'github'
};

export const gitRepoIndexer = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: Indexer<GitHubFile> ) =>
  processTreeRoot<GitHubFolder, GitHubFile, GithubIndexedFile> ( ic.logAndMetrics, githubTc ( nf, ic, githubDetails ), indexer );


