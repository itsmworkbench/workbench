import { access, addNonFunctionalsToIndexForestTc, addNonFunctionalsToIndexTreeTC, ExecuteIndexOptions, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, IndexTreeTc, processTreeRoot, SourceSinkDetails } from "@itsmworkbench/indexing";
import { IndexTreeNonFunctionals } from "@itsmworkbench/indexing/src/indexing.non.functionals";
import { mapK, toArray } from "@laoban/utils";
import { addNonFunctionalsToIndexParentChildTc, indexParentChild, IndexParentChildTc } from "@itsmworkbench/indexing/";
import { githubAccessOptions, GitHubPaging, gitHubPagingTC } from "./github.paging";
import { githubDetails, GitHubDetails, GitHubFile, gitHubFileDetailsToIndexedFile, GitHubFolder, GithubIndexedFile, GithubIndexedMember, gitHubMemberToIndexedFile, GitHubOrganisation, GitHubOrgMember, GitHubOrgMembers } from "./github.domain";

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


const indexAnOrganisationTc = ( ic: IndexingContext ): IndexForestTc<GitHubOrganisation, GitHubPaging> => ({
  fetchForest: ( forestId, paging ) =>
    access ( ic, githubDetails, paging?.next || `/orgs/${forestId}/repos`, githubAccessOptions ),
  treeIds: ( forest ) => forest.map ( x => x.full_name ),
});

const indexAUserTc = ( ic: IndexingContext ): IndexForestTc<GitHubOrganisation, GitHubPaging> => ({
  fetchForest: ( userName, page ) => access ( ic, githubDetails, page.next ? page.next : `/users/${userName}/repos`, githubAccessOptions ),
  treeIds: ( userName ) => userName.map ( x => x.full_name )
})
const indexMembersTc = ( ic: IndexingContext ) => ({
  fetchParent: ( orgName ) => access ( ic, githubDetails, `/orgs/${orgName}/members`, githubAccessOptions ).then ( x => x.data as GitHubOrgMembers ),
  children: ( orgName, parent: GitHubOrgMembers ) => parent.map ( x => ({ login: x.login }) )
})

export type GitHubTcs = {
  indexGitHubRepoTc: IndexTreeTc<GitHubFolder, GitHubFile, GithubIndexedFile, GitHubPaging>,
  indexAnOrganisationTc: IndexForestTc<GitHubOrganisation, GitHubPaging>
  indexAnUserTc: IndexForestTc<GitHubOrganisation, GitHubPaging>
  indexAnOrganisationMembersTc: IndexParentChildTc<GitHubOrgMembers, GithubIndexedMember>
}


export const githubTcs = ( nf: IndexTreeNonFunctionals, ic: IndexingContext ): GitHubTcs => ({
  indexGitHubRepoTc: githubRepoTreeTc ( nf, ic, githubDetails ),
  indexAnOrganisationTc: addNonFunctionalsToIndexForestTc ( nf, indexAnOrganisationTc ( ic ) ),
  indexAnUserTc: addNonFunctionalsToIndexForestTc ( nf, indexAUserTc ( ic ) ),
  indexAnOrganisationMembersTc: addNonFunctionalsToIndexParentChildTc ( nf, indexMembersTc ( ic ) )
})

//Probably right level of granularity for a workflow
//which means we need to change it a little. But again we can do that later
//Probably right level of granularity for a workflow
// export const indexGitHubPeopleInOrganisation = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, indexer: ( repoId: string ) => Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) =>


export function indexOneGithubRepo ( ic: IndexingContext, indexGitHubRepoTc: IndexTreeTc<GitHubFolder, GitHubFile, GithubIndexedFile, GitHubPaging>, indexer: Indexer<GitHubFile>, executeOptions: ExecuteIndexOptions ) {
  return processTreeRoot<GitHubFolder, GitHubFile, GithubIndexedFile, GitHubPaging> ( ic.treeLogAndMetrics, indexGitHubRepoTc, gitHubPagingTC, indexer, executeOptions );
}
export function indexOrganisations ( ic: IndexingContext, indexAnOrganisationTc: IndexForestTc<GitHubOrganisation, GitHubPaging>, indexGitHubRepo: ( rootId: string ) => Promise<void>, requestOrgs: string[] ) {
  return mapK ( requestOrgs, indexForestOfTrees ( ic.forestLogAndMetrics, indexAnOrganisationTc, gitHubPagingTC, orgId => indexGitHubRepo ) );
}
export function indexTheUserRepos ( ic: IndexingContext, indexAnUserTc: IndexForestTc<GitHubOrganisation, GitHubPaging>, indexGitHubRepo: ( rootId: string ) => Promise<void>, users: string[] ) {
  return mapK ( toArray ( users ), indexForestOfTrees ( ic.forestLogAndMetrics, indexAnUserTc, gitHubPagingTC, userId => indexGitHubRepo ) );
}

export function indexOrgMembers ( ic: IndexingContext, indexAnOrganisationMembersTc: IndexParentChildTc<GitHubOrgMember[], GithubIndexedMember>,
                                  indexer: Indexer<GithubIndexedMember>, executeOptions: ExecuteIndexOptions, requestOrgs: string[]
) {
  return mapK ( requestOrgs, indexParentChild<GitHubOrgMembers, GithubIndexedMember, GithubIndexedMember, GitHubPaging> (
    ic.parentChildLogAndMetrics, indexAnOrganisationMembersTc, gitHubPagingTC,
    gitHubMemberToIndexedFile,
    ( orgName, c ) => `${orgName}_${c.login}`, // childId
    executeOptions ) ( indexer ) );  //
}
//This is a workflow that calls other workflows. I think we can use this as written as a workflow. We can do that later...
export function indexGitHubFully ( nf: IndexTreeNonFunctionals,
                                   ic: IndexingContext,
                                   fileIndexer: ( fileTemplate: string, indexId: string ) => Indexer<GitHubFile>,
                                   memberIndexer: ( ileTemplate: string, indexId: string ) => Indexer<GithubIndexedMember>,
                                   executeOptions: ExecuteIndexOptions ) {
  return async ( github: GitHubDetails ) => {
    const requestOrgs = toArray ( github.organisations );
    const { indexAnUserTc, indexGitHubRepoTc, indexAnOrganisationTc, indexAnOrganisationMembersTc } = githubTcs ( nf, ic );
    const indexer = fileIndexer ( github.file, github.index );

    const indexGitHubRepo = indexOneGithubRepo ( ic, indexGitHubRepoTc, indexer, executeOptions );
    const organisations = indexOrganisations ( ic, indexAnOrganisationTc, indexGitHubRepo, requestOrgs );
    const owners = indexTheUserRepos ( ic, indexAnUserTc, indexGitHubRepo, github.users )

    const people = github.indexPeople ? indexOrgMembers ( ic, indexAnOrganisationMembersTc,
      memberIndexer ( github.file, github.aclIndex ), executeOptions, github.organisations ) : Promise.resolve ( [] );
    return { organisations: await organisations, owners: await owners, people: await people }
  }
}

