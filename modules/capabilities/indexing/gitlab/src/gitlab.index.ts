import { access, AccessConfig, addNonFunctionalsToIndexForestTc, addNonFunctionalsToIndexParentChildTc, ExecuteIndexOptions, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, indexParentChild, IndexParentChildTc, IndexTreeNonFunctionals, PagingTc, SourceSinkDetails } from "@itsmworkbench/indexing";
import { mapK, safeArray } from "@laoban/utils";
import { K1, } from "@itsmworkbench/kleislis";
import { GitLabMemberDetails } from "./gitlab.dls";
import { withoutFirstSegment } from "@itsmworkbench/utils";

export interface GitlabDetails extends SourceSinkDetails {
  index: string;
  aclIndex: string;
  file: string;
  projects?: string[];

}

export type GitlabProject = {
  id: number
  path_with_namespace: string
  default_branch: string
  namespace: {
    parent_id: number
    kind: 'group'
  }
}
export type GitlabProjects = GitlabProject[]

export type GitlabPaging = {
  next?: string
}
export const GitlabPagingTc: PagingTc<GitlabPaging> = {
  zero: () => ({ next: undefined }),  // Initialize without a next page
  hasMore: ( p: GitlabPaging ) => !!p.next,  // Check if the next page URL exists
  logMsg: ( p: GitlabPaging ) => p.next ? `Next page available at: ${p.next}` : "No more pages available",
  url: () => {throw new Error ( 'Not implemented' )},
  fromResponse: ( json, linkHeader ) => {throw new Error ( 'Not implemented' ) }
};
export function parseLinkHeader ( linkHeader: string | null ): GitlabPaging {
  if ( linkHeader ) {
    const linkRegex = /<([^>]+)>;\s*rel="([^"]+)"/g;
    let match;
    while ( (match = linkRegex.exec ( linkHeader )) !== null )
      if ( match[ 2 ] === 'next' )
        return { next: match[ 1 ] };  // Return early if 'next' link is found
  }
  return {};  // Return undefined if no 'next' link is found
}

export const gitlabAccessOptions: AccessConfig<GitlabPaging> = {
  pagingFn: ( json, linkHeader ) => parseLinkHeader ( linkHeader )
}

export type GitLabFileOrDir = {
  id: string
  name: string
  type: 'tree' | 'blob'
  path: string
}
export type GitLabIndexedFile = {
  projectId: number
  id: string
  path: string
  fullPath: string
  url: string
  content: string
}
export type GitLabRepo = GitLabFileOrDir[]
export function gitlabRepoTc ( ic: IndexingContext, details: GitlabDetails ): IndexParentChildTc<GitLabRepo, GitLabFileOrDir, GitlabPaging> {
  return {
    fetchParent: ( repoUrl, page ) =>
      access ( ic, details, page.next ? page.next : repoUrl, gitlabAccessOptions ),
    children: ( repoUrl, parent ) =>
      parent.filter ( f => f.type === 'blob' && f.path.endsWith ( '.md' ) )

  }
}

export type GitLabFileWithContentDetails = {
  file_name: string
  file_path: string
  content: string
  encoding: 'base64'
}
export const gitLabFileToIndexedFile = ( ic: IndexingContext, gitlabDetails: GitlabDetails, project: GitlabProject ) => async ( f: GitLabFileOrDir ): Promise<GitLabIndexedFile> => {
  const url = `api/v4/projects/${project.id}/repository/files/${encodeURIComponent ( f.path )}?ref=${project.default_branch}`
  const gitlabFileDetails: GitLabFileWithContentDetails = await access<GitLabFileWithContentDetails, any> ( ic, gitlabDetails, url,
    { pagingFn: ( json, linkHeader ) => ({}) } ).then ( r => r.data )
  const result: GitLabIndexedFile = {
    projectId: project.id,
    id: f.id,
    path: f.path,
    fullPath: `${withoutFirstSegment(project.path_with_namespace)}/${f.path}`,
    url: `${gitlabDetails.baseurl}/${project.path_with_namespace}/-/blob/${project.default_branch}/${f.path}`,
    content: gitlabFileDetails.encoding === 'base64' ? Buffer.from ( gitlabFileDetails.content, 'base64' ).toString ( 'utf-8' ) : gitlabFileDetails.content
  }
  return result
};
export function indexGitlabRepo ( ic: IndexingContext, gitLabDetail: GitlabDetails, tc: IndexParentChildTc<GitLabRepo, GitLabFileOrDir, GitlabPaging>, indexer: Indexer<GitLabIndexedFile>, executeOptions: ExecuteIndexOptions ): ( gitlabProject: GitlabProject ) => Promise<void> {
  return ( project: GitlabProject ) => {
    const url = `api/v4/projects/${project.id}/repository/tree?ref=${project.default_branch}&recursive=true`
    return indexParentChild ( ic.parentChildLogAndMetrics, tc, GitlabPagingTc,
      gitLabFileToIndexedFile ( ic, gitLabDetail, project ),
      ( parentId, c ) => `${project.id}/${c.path}`,
      executeOptions ) ( indexer ) ( url );
  }
}


//.map ( p =>
//       `api/v4/projects/${p.id}/repository/tree?ref=${p.default_branch}&recursive=true` )
export function gitlabProjectsTc ( ic: IndexingContext, details: GitlabDetails ): IndexForestTc<GitlabProjects, GitlabProject, GitlabPaging> {
  return {
    fetchForest: ( projectName, page ) =>
      access ( ic, details, page.next ? page.next : `api/v4/groups/${projectName}/projects`, gitlabAccessOptions ),
    treeIds: ( projects ) => projects,
    treeToString: ( p ) => `${p.id}/${p.default_branch}`
  }
}

export function indexGitlabProjects ( ic: IndexingContext, tc: IndexForestTc<GitlabProjects, GitlabProject, GitlabPaging>,
                                      fn: K1<GitlabProject, void> ): ( projectId: string ) => Promise<void> {

  const indexerForProject: ( forestId: string ) => Promise<void> =
          indexForestOfTrees ( ic.forestLogAndMetrics, tc, GitlabPagingTc, pid => fn );

  return ( projectId: string ) =>
    indexerForProject ( projectId )
}


export function indexGitlabFully ( nfc: IndexTreeNonFunctionals, ic: IndexingContext,
                                   fileIndexer: ( fileTemplate: string, indexId: string ) => Indexer<GitLabIndexedFile>,
                                   memberIndex: ( fileTemplate: string, indexId: string ) => Indexer<GitLabMemberDetails>,
                                   executeOptions: ExecuteIndexOptions ) {
  return async ( details: GitlabDetails ) => {


    const indexProjectsTc = addNonFunctionalsToIndexForestTc ( nfc, gitlabProjectsTc ( ic, details ) )
    const indexRepoTc = addNonFunctionalsToIndexParentChildTc ( nfc, gitlabRepoTc ( ic, details ) )

    const projects = safeArray ( details.projects );
    const processOneProject = async ( p: GitlabProject ) => {
      await indexGitlabRepo ( ic, details, indexRepoTc, fileIndexer ( details.file, details.index ), executeOptions ) ( p );
    };
    await mapK ( projects, indexGitlabProjects ( ic, indexProjectsTc, processOneProject ) )
  }
}