import { access, AccessConfig, addNonFunctionalsToIndexForestTc, addNonFunctionalsToIndexTreeTC, ExecuteIndexOptions, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, IndexTreeTc, processTreeRoot, SourceSinkDetails } from "@itsmworkbench/indexing";
import { IndexTreeNonFunctionals } from "@itsmworkbench/indexing/src/indexing.non.functionals";
import { mapK, toArray } from "@laoban/utils";
import { addNonFunctionalsToIndexParentChildTc, indexParentChild, IndexParentChildTc } from "@itsmworkbench/indexing/";
import { PagingTc } from "@itsmworkbench/indexing/src/paging";

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

export type GithubIndexedMember = GitHubOrgMember
export function gitHubMemberToIndexedFile ( member: GitHubOrgMember ): GithubIndexedMember {
  return { login: member.login }

}

export type GithubIndexedFile = {
  name: string;
  path: string;
  url: string
  html_url: string
  content: string;
}

export type GitHubDetails = {
  index: string,
  aclIndex: string
  file: string
  organisations: string[]
  users: string[]
  indexPeople?: boolean
}

export type GitHubPaging = {
  next?: string
}
/**
 * Parses the Link header to find the next page URL.
 * @param linkHeader The content of the Link response header.
 * @return {GitHubPaging} The GitHubPaging object with the next URL if available.
 */
export function parseGitHubLinkHeader(json: any,linkHeader: string | null): GitHubPaging {
  if (!linkHeader) return {};

  const links = linkHeader.split(',').reduce((acc, link) => {
    const parts = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (parts) {
      acc[parts[2]] = parts[1];
    }
    return acc;
  }, {} as { [key: string]: string });

  return { next: links.next };
}
export const githubAccessOptions: AccessConfig<GitHubPaging> = {
  pagingFn: parseGitHubLinkHeader
}
export function githubRepoTreeTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ):
  IndexTreeTc<GitHubFolder, GitHubFile, GithubIndexedFile, GitHubPaging> {
  return addNonFunctionalsToIndexTreeTC ( nf, {
    folderIds: ( rootId, p, f ) =>
      f.filter ( x => x.type === 'dir' ).map ( x => x.path ),
    leafIds: ( rootId, p, f ) =>
      f.filter ( x => x.type === 'file' && x.path.endsWith ( '.md' ) ).map ( x => x.path ),
    fetchFolder: ( rootId, folderId, page ) =>
      access ( ic, githubDetails, page?.next || `/repos/${rootId}/contents/${folderId}`, githubAccessOptions ),

    fetchLeaf: ( rootId, leafId ) =>
      access ( ic, githubDetails, `/repos/${rootId}/contents/${leafId}`, {} ).then ( x => x.data as GitHubFile ),
    prepareLeaf: ( rootId ) =>
      async ( leaf ) => gitHubFileDetailsToIndexedFile ( leaf )
  } )
}

export const gitHubPagingTC: PagingTc<GitHubPaging> = {
  zero: () => ({}),
  hasMore: ( page ) => page.next !== undefined,
  logMsg: ( page ) => `Next Page: ${page.next}`
}

export function githubIndexAnOrganisationTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexForestTc<GitHubOrganisation, GitHubPaging> {
  return addNonFunctionalsToIndexForestTc ( nf, {
    fetchForest: ( forestId, paging ) =>
      access ( ic, githubDetails, paging?.next || `/orgs/${forestId}/repos`, githubAccessOptions ),
    treeIds: ( forest ) => forest.map ( x => x.full_name ),

  } )
}
export function githubIndexAnUserTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexForestTc<GitHubOrganisation, GitHubPaging> {
  return addNonFunctionalsToIndexForestTc ( nf, {
    fetchForest: ( userName, page ) => access ( ic, githubDetails, page.next ? page.next : `/users/${userName}/repos`, githubAccessOptions ),
    treeIds: ( userName ) => userName.map ( x => x.full_name )
  } )
}
export function githubIndexAnOrganisationMembersTc ( nf: IndexTreeNonFunctionals, ic: IndexingContext, githubDetails: SourceSinkDetails ): IndexParentChildTc<GitHubOrgMembers, GithubIndexedMember> {
  return addNonFunctionalsToIndexParentChildTc<GitHubOrgMembers, GitHubOrgMember> ( nf, {
    fetchParent: ( orgName ) => access ( ic, githubDetails, `/orgs/${orgName}/members`, githubAccessOptions ).then ( x => x.data as GitHubOrgMembers ),
    children: ( orgName, parent: GitHubOrgMembers ) => parent.map ( x => ({ login: x.login }) )
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
  const process = processTreeRoot<GitHubFolder, GitHubFile, GithubIndexedFile, GitHubPaging> ( ic.treeLogAndMetrics, tc, gitHubPagingTC,indexer, executeOptions );
  return ( rootId ) =>
    process ( rootId )
};


//Probably right level of granularity for a workflow
//which means we need to change it a little. But again we can do that later
export const indexGitHubOrganisation = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>
  indexForestOfTrees<GitHubOrganisation, GitHubPaging> ( ic.forestLogAndMetrics, githubIndexAnOrganisationTc ( nf, ic, githubDetails ), gitHubPagingTC, orgId => indexGitHubRepo ( nf, ic, indexer, executeOptions ) )
//Probably right level of granularity for a workflow
export const indexGitHubUser = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>
  indexForestOfTrees<GitHubOrganisation, GitHubPaging> ( ic.forestLogAndMetrics, githubIndexAnUserTc ( nf, ic, githubDetails ), gitHubPagingTC, userId => indexGitHubRepo ( nf, ic, indexer, executeOptions ) )


export const indexOrganisationMembers = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: Indexer<GithubIndexedMember>, executeOptions: ExecuteIndexOptions ) =>
  indexParentChild<GitHubOrgMembers, GithubIndexedMember, GithubIndexedMember> (
    ic.parentChildLogAndMetrics,
    githubIndexAnOrganisationMembersTc ( nf, ic, githubDetails ),
    gitHubMemberToIndexedFile,
    indexer,
    ( orgName, c ) => `${orgName}_${c.login}`,
    executeOptions )

// export const indexGitHubPeopleInOrganisation = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>


//This is a workflow that calls other workflows. I think we can use this as written as a workflow. We can do that later...
export function indexGitHubFully ( nf: IndexTreeNonFunctionals,
                                   ic: IndexingContext,
                                   fileIndexer: ( fileTemplate: string, indexId: string ) => Indexer<GitHubFile>,
                                   memberIndexer: ( ileTemplate: string, indexId: string ) => Indexer<GithubIndexedMember>,
                                   executeOptions: ExecuteIndexOptions ) {
  return async ( github: GitHubDetails ) => {
    const indexGitHub = indexGitHubOrganisation ( nf, ic, fileIndexer ( github.file, github.index ), executeOptions );
    const indexOwners = indexGitHubUser ( nf, ic, fileIndexer ( github.file, github.index ), executeOptions );
    const indexOrgMembers = indexOrganisationMembers ( nf, ic, memberIndexer ( github.file, github.aclIndex ), executeOptions );
    const requestOrgs = toArray ( github.organisations );
    const organisations = mapK ( requestOrgs, indexGitHub )
    const owners = mapK ( toArray ( github.users ), indexOwners )
    const people = github.indexPeople ? mapK ( requestOrgs, indexOrgMembers ) : Promise.resolve ( {} )
    return { organisations: await organisations, owners: await owners, people: await people }
  }
}

