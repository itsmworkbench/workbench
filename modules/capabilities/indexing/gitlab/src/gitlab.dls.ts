import { access, ExecuteIndexOptions, fetchArrayWithPaging, FetchArrayWithPagingType, FetchFn, fetchOneItem, FetchOneItemType, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, indexParentChild, IndexParentChildTc, IndexTreeNonFunctionals, NoPaging, NoPagingTc, SourceSinkDetails } from "@itsmworkbench/indexing";
import { gitlabAccessOptions, GitlabPaging, GitlabPagingTc, GitlabProject } from "./gitlab.index";
import { NameAnd } from "@laoban/utils";
import { withRetry, withThrottle } from "@itsmworkbench/kleislis";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { simpleTemplate } from "@itsmworkbench/utils";

export type GitLabUser = {
  id: string
  username: string
  name: string
  membership_state: 'active'
}
export type GitLabMemberDetails = {
  id: string
  username: string
  public_email: string
}
export function indexGitLabRepoToMembersTc ( ic: IndexingContext, details: GitlabAclDetails ): IndexForestTc<GitLabUser[], GitLabUser, GitlabPaging> {
  return {
    fetchForest: ( projectId, page ) =>
      access ( ic, details, page.next ? page.next : `api/v4/projects/${projectId}/members/all`, gitlabAccessOptions ),
    treeIds: ( users ) => users.filter ( u => u.membership_state === 'active' ),
    treeToString: ( u ) => `${u.id}/${u.username}`
  }
}

export function indexGitLabUserToGitLabMemberDetails ( ic: IndexingContext, details: GitlabAclDetails ): IndexParentChildTc<GitLabMemberDetails, GitLabMemberDetails, NoPaging> {
  return {
    fetchParent: ( projectId, page ) =>
      access ( ic, details, `api/v4/users/${projectId}`, gitlabAccessOptions ),
    children: ( parentId, parent ) => [ parent ],
    // treeToString: ( u ) => `${u.id}/${u.username}`
  }
}

export function indexGitLabMembers ( ic: IndexingContext,
                                     tcToUser: IndexForestTc<GitLabUser[], GitLabUser, GitlabPaging>,
                                     tcToMember: IndexParentChildTc<GitLabMemberDetails, GitLabMemberDetails, NoPaging>,
                                     indexer: Indexer<GitLabMemberDetails>,
                                     executeOptions: ExecuteIndexOptions ): ( projectId: string ) => Promise<void> {
  const indexerForMembers: ( forestId: string ) => Promise<void> =
          indexParentChild ( ic.parentChildLogAndMetrics,
            tcToMember, GitlabPagingTc,
            async ( p ) => ({ id: p.id, username: p.username, public_email: p.public_email }),
            ( p, c ) => c.id,
            executeOptions ) ( indexer )
  const indexerForUsers = indexForestOfTrees ( ic.forestLogAndMetrics, tcToUser, NoPagingTc, pid => u => indexerForMembers ( u.id.toString () ) )
  return ( projectId: string ) => indexerForUsers ( projectId )
}
export interface GitlabAclDetails extends SourceSinkDetails {
  index: string;
  file: string;
  idPattern: string;
  projects?: string[];
}
export type GitLabGroup = {
  parent_id?: number

}
export async function projectToName ( fetchArray: FetchArrayWithPagingType, fetchOne: FetchOneItemType, headers: NameAnd<string>, details: GitlabAclDetails ): Promise<any> {
  const result: Record<number, string[]> = {} //map from project id to member name
  for await ( const project of fetchArray<GitlabProject> ( `${details.baseurl}api/v4/projects`, { headers } ) ) {
    const projectId = project.id
    result[ projectId ] = []
    async function addGroupMembers ( groupId: number ) {
      if ( groupId ) {
        for await ( const members of fetchArray<GitLabUser> ( `${details.baseurl}api/v4/groups/${groupId}/members/all`, { headers } ) ) {
          result[ projectId ].push ( members.username )
        }
        const group = await fetchOne<GitLabGroup> ( `${details.baseurl}api/v4/groups/${groupId}`, { headers } )
        if ( group.parent_id !== undefined )
          await addGroupMembers ( group.parent_id )
      }
    }
    for await ( const members of fetchArray<GitLabUser> ( `${details.baseurl}api/v4/projects/${project.id}/members/all`, { headers } ) )
      result[ projectId ].push ( members.username )
    if ( project.namespace.kind === 'group' ) await addGroupMembers ( project.namespace.parent_id )
  }
  return result
}

function invert ( p2name: Record<number, string[]> ): NameAnd<number[]> {
  const result: NameAnd<number[]> = {}
  for ( const [ projectId, names ] of Object.entries ( p2name ) )
    for ( const name of names ) {
      if ( !result[ name ] ) result[ name ] = []
      result[ name ].push ( Number.parseInt ( projectId.toString () ) )
    }
  return result
}

function toIndexData ( template: string, name: string, projects: number[] ) {
  return {
    _id: simpleTemplate ( template, { id: name } ),
    data: {
      projects,
      query: JSON.stringify (
        {
          "bool": {
            "filter": [
              { "term": { "type": "gitlab" } },
              { "terms": { "project": projects } }
            ]
          }
        } )
    }
  }
}
export const indexGitlabAcl = ( nfs: IndexTreeNonFunctionals, ic: IndexingContext, indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any>, option: ExecuteIndexOptions ) => {
  const nfcFetch: FetchFn = withRetry ( nfs.queryRetryPolicy, withThrottle ( nfs.queryThrottle, ic.fetch ) )
  // const nfcFetch: FetchFn = withThrottle ( nfs.indexThrottle, ic.fetch )
  const fArray: FetchArrayWithPagingType = fetchArrayWithPaging ( nfcFetch, ic.parentChildLogAndMetrics, ConfluencePagingTC, nfs.queryRetryPolicy );
  const fOne = withRetry ( nfs.queryRetryPolicy, fetchOneItem ( nfcFetch ) )

  return async ( details: GitlabAclDetails ) => {
    const indexer: Indexer<any> = indexerFn ( details.file, details.index )
    await indexer.start ( details.index )
    try {
      let headers = await ic.authFn ( details.auth );
      const p2name = await projectToName ( fArray, fOne, headers, details )
      const name2Projects = invert ( p2name )
      for ( const [ name, projects ] of Object.entries ( name2Projects ) ) {
        const result = toIndexData ( details.idPattern, name, projects )
        await indexer.processLeaf ( details.index, result._id ) ( result.data )
      }
      await indexer.finished ( details.index )
    } catch ( e ) {
      await indexer.failed ( details.index, e )
    }
  }
}

