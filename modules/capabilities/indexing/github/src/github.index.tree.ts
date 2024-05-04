import { access, addNonFunctionalsToIndexTreeTC, ExecuteIndexOptions, Indexer, IndexingContext, IndexTreeLogAndMetrics, IndexTreeTc, processTreeRoot, SourceSinkDetails } from "@itsmworkbench/indexing";
import { IndexTreeNonFunctionals } from "@itsmworkbench/indexing/src/indexing.non.functionals";
import { addNonFunctionalsToIndexForestTc, indexForest, IndexForestTc } from "@itsmworkbench/indexing/src/forest.index";
import { flatMapK, mapK, toArray } from "@laoban/utils";

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

export type GitHubRepo = {
  name: string;
  full_name: string;
  owner: {
    login: string
    type: 'Organization'
  }
}
export type GitHubOrganisation = GitHubRepo[]
export type GitHubOrgMember = {
  login: string
}
export type GitHubOrgMembers = GitHubOrgMember[]
export function gitHubFileDetailsToIndexedFile ( file: GitHubFile ): GithubIndexedFile {
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

export type GitHubDetails = {
  organisations: string[]
  users: string[]
  aclIndex: string
  indexPeople?: boolean
}

export function githubRepoTreeTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexTreeTc<GitHubFolder, GitHubFile, GithubIndexedFile> {
  return addNonFunctionalsToIndexTreeTC ( nf, {
    folderIds: ( rootId, p, f ) =>
      f.filter ( x => x.type === 'dir' ).map ( x => x.path ),
    leafIds: ( rootId, p, f ) =>
      f.filter ( x => x.type === 'file' && x.path.endsWith ( '.md' ) ).map ( x => x.path ),
    fetchFolder: ( rootId, folderId ) =>
      access ( ic, githubDetails, `/repos/${rootId}/contents/${folderId}` ),
    fetchLeaf: ( rootId, leafId ) =>
      access ( ic, githubDetails, `/repos/${rootId}/contents/${leafId}` ),
    prepareLeaf: ( rootId ) =>
      async ( leaf ) => gitHubFileDetailsToIndexedFile ( leaf )
  } )
}


export function githubIndexAnOrganisationTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexForestTc<GitHubOrganisation> {
  return addNonFunctionalsToIndexForestTc ( nf, {
    fetchForest: ( forestId ) => access ( ic, githubDetails, `/orgs/${forestId}/repos` ),
    treeIds: ( forest ) => forest.map ( x => x.full_name )
  } )
}
export function githubIndexAnUserTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexForestTc<GitHubOrganisation> {
  return addNonFunctionalsToIndexForestTc ( nf, {
    fetchForest: ( userName ) => access ( ic, githubDetails, `/users/${userName}/repos` ),
    treeIds: ( userName ) => userName.map ( x => x.full_name )
  } )
}
export function githubIndexAnOrganisationMembersTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexForestTc<GitHubOrgMembers> {
  return addNonFunctionalsToIndexForestTc<GitHubOrgMembers> ( nf, {
    fetchForest: ( orgName ) => access ( ic, githubDetails, `/orgs/${orgName}/members` ),
    treeIds: ( orgName ) => orgName.map ( x => x.login )
  } )
}


const token = process.env.GITHUB_TOKEN;
if ( token === null || token == undefined ) {
  throw new Error ( 'GITHUB_TOKEN not set in environment' )
}

export const githubDetails: SourceSinkDetails = {
  baseurl: "https://api.github.com",
  authentication: { method: 'ApiKey', credentials: { apiKey: 'GITHUB_TOKEN' } }
};

//an activity I think
export const indexGitHubRepo = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) => {
  const tc = githubRepoTreeTc ( nf, ic, githubDetails );
  const process = processTreeRoot<GitHubFolder, GitHubFile, GithubIndexedFile> ( ic.treeLogAndMetrics, tc, indexer, executeOptions );
  return ( rootId ) =>
    process ( rootId )
};


//Probably right level of granularity for a workflow
//which means we need to change it a little. But again we can do that later
export const indexGitHubOrganisation = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>
  indexForest<GitHubOrganisation> ( ic.forestLogAndMetrics, githubIndexAnOrganisationTc ( nf, ic, githubDetails ),
    forestId => {
      return indexGitHubRepo ( nf, ic, indexer ( forestId ), executeOptions );
    }
  )
//Probably right level of granularity for a workflow
export const indexGitHubUser = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>
  indexForest<GitHubOrganisation> ( ic.forestLogAndMetrics, githubIndexAnUserTc ( nf, ic, githubDetails ),
    repoId => indexGitHubRepo ( nf, ic, indexer ( repoId ), executeOptions )
  )

export const indexOrganisationMembers = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>
  indexForest<GitHubOrgMembers> ( ic.forestLogAndMetrics, githubIndexAnOrganisationMembersTc ( nf, ic, githubDetails ),
    repoId => indexGitHubRepo ( nf, ic, indexer ( repoId ), executeOptions )
  )

// export const indexGitHubPeopleInOrganisation = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>


//This is a workflow that calls other workflows. I think we can use this as written as a workflow. We can do that later...
export function indexGitHubFully ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( forestId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) {
  const indexGitHub = indexGitHubOrganisation ( nf, ic, indexer, executeOptions );
  const indexOwners = indexGitHubUser ( nf, ic, indexer, executeOptions );
  const indexOrgMembers = indexOrganisationMembers ( nf, ic, indexer, executeOptions );
  return async ( github: GitHubDetails ) => {
    const requestOrgs = toArray ( github.organisations );
    const organisations = await mapK ( requestOrgs, indexGitHub ) //TODO remove await
    const owners = mapK ( toArray ( github.users ), indexOwners )
    const people = github.indexPeople ? mapK ( requestOrgs, indexOrgMembers ) : Promise.resolve ( {} )
    return { organisations: await organisations, owners: await owners, people: await people }
  }
}

