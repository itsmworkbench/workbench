import { access, ExecuteIndexOptions, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, indexParentChild, IndexParentChildTc, NoPaging, NoPagingTc } from "@itsmworkbench/indexing";
import { gitlabAccessOptions, GitlabDetails, GitlabPaging, GitlabPagingTc } from "./gitlab.index";

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
export function indexGitLabRepoToMembersTc ( ic: IndexingContext, details: GitlabDetails ): IndexForestTc<GitLabUser[], GitLabUser, GitlabPaging> {
  return {
    fetchForest: ( projectId, page ) =>
      access ( ic, details, page.next ? page.next : `api/v4/projects/${projectId}/members/all`, gitlabAccessOptions ),
    treeIds: ( users ) => users.filter ( u => u.membership_state === 'active' ),
    treeToString: ( u ) => `${u.id}/${u.username}`
  }
}

export function indexGitLabUserToGitLabMemberDetails ( ic: IndexingContext, details: GitlabDetails ): IndexParentChildTc<GitLabMemberDetails, GitLabMemberDetails, NoPaging> {
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


