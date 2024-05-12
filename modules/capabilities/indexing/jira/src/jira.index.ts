import { access, AccessConfig, addNonFunctionalsToIndexForestTc, addNonFunctionalsToIndexParentChildTc, ExecuteIndexOptions, Indexer, indexForestOfTrees, IndexForestTc, IndexingContext, indexParentChild, IndexParentChildTc, IndexTreeNonFunctionals, nullAccessConfig, PagingTc, SourceSinkDetails } from "@itsmworkbench/indexing";
import { flatMap } from "@laoban/utils";

export interface JiraDetails extends SourceSinkDetails {
  index: string;
  aclIndex: string;
  file: string;
  projects?: string[];
  apiVersion: string; //2 for jira data center, 3 for cloud
}

export type JiraProjectPaging = {

}

export const JiraProjectPagingTc: PagingTc<JiraProjectPaging> = {
  zero: () => ({}),
  hasMore: ( page ) => false,
  logMsg: ( page ) => ``
}

export type JiraIssuePaging = {
  startAt: number
  maxResults: number
  total: number
}
export function jiraIssuePagingQuerySuffix ( j: JiraIssuePaging ) {
  return `&startAt=${j.startAt}&maxResults=${j.maxResults}`

}

export const JiraIssuePagingTc: PagingTc<JiraIssuePaging> = {
  zero: () => ({ startAt: 0, maxResults: 1, total: undefined as number }),
  hasMore: ( page ) => page.startAt + page.maxResults <= page.total,
  logMsg: ( page ) => `Page: ${page.startAt}..${page.startAt + page.maxResults} of ${page.total}`
}
export type JiraProjectTopLevelSummary = {
  id: string
  self: string
  name: string
  key: string
  projectTypeKey: string
  issues: JiraIssue[]
}

export type JiraProjects = JiraProjectTopLevelSummary[]


export type JiraProjectDetail = {
  issues: JiraIssue[]
}

export type JiraIssue = {
  id: string
  self: string
  summary: string
  fields: JiraIssueFields
}
export type JiraIssueCommentField = {
  comments: JiraIssueComment[]
}
export type JiraIssueComment = {
  body: JiraDoc | string
}
export type JiraIssueFields = {
  reporter: { email: string };
  assignee: { email: string },
  comment: JiraIssueCommentField
  description: JiraDoc
  project: { self: string }
  priority: any;
  summary: string
  status: { name: string, }
}
export type JiraDoc = {
  type: 'doc',
  content: JiraDocContent[]
}
export type JiraDocContent = {
  type: 'paragraph',
  content: JiraParagraphContent[]
}
export type JiraParagraphContent = {
  type: 'text',
  text: string
}

export const jiraProjectAccessOptions: AccessConfig<JiraProjectPaging> = {
  pagingFn: ( json, linkHeader ) => ({})
}
export const jiraIssueAccessOptions: AccessConfig<JiraIssuePaging> = {
  extraHeaders: { 'Accept': 'application/json' },
  //remember this is 'get me the next page'
  pagingFn: ( json, linkHeader ) => ({ startAt: json.startAt + json.maxResults, maxResults: json.maxResults, total: json.total })
}

export function getAllParagraphContent ( doc: JiraDoc ): string {
  return doc.content.filter ( c => c.type === 'paragraph' )
    .map ( p => p.content.filter ( p => p.type === 'text' )
      .map ( c => c.text )
      .join ( '\n' ) ).join ( '\n' )
}
export const jiraProjectsForestTc = ( ic: IndexingContext, details: JiraDetails ): IndexForestTc<JiraProjects, JiraProjectPaging> => ({
  fetchForest: ( forestId, paging ) =>
    access ( ic, details,  `rest/api/${details.apiVersion}/project`, jiraProjectAccessOptions ),
  treeIds: ( forest ) =>
    forest.map ( x => x.key ),
})
export const JiraProjectToIssueTc = ( ic: IndexingContext, details: JiraDetails ): IndexParentChildTc<JiraProjectTopLevelSummary, JiraIssue, JiraIssuePaging> => ({
  fetchParent: ( forestId, page ) => {
    const url = `rest/api/${details.apiVersion}/search?jql=project=${forestId}&fields=*all,comment${jiraIssuePagingQuerySuffix ( page )}`;
    return access ( ic, details, url, jiraIssueAccessOptions );
  },
  children: ( parentId, parent ) =>
    parent.issues
})

export type JiraTcs = {
  jiraProjectsForestTc: IndexForestTc<JiraProjects, JiraProjectPaging>
  jiraProjectToIssueTc: IndexParentChildTc<JiraProjectTopLevelSummary, JiraIssue, JiraIssuePaging>
}
export const jiraTcs = ( nf: IndexTreeNonFunctionals, ic: IndexingContext, jiraDetails: JiraDetails ): JiraTcs => ({
  jiraProjectsForestTc: addNonFunctionalsToIndexForestTc ( nf, jiraProjectsForestTc ( ic, jiraDetails ) ),
  jiraProjectToIssueTc: addNonFunctionalsToIndexParentChildTc ( nf, JiraProjectToIssueTc ( ic, jiraDetails ) )
})

export type JiraIndexedIssue = {
  id: string
  self: string
  project: string
  priority: any
  status: any
  summary: string
  assignee: string
  reporter: string
  comments: string // probably want some better structure here
}
export function jiraIssueToIndexedJiraIssue ( j: JiraIssue ): JiraIndexedIssue {
  return {
    id: j.id,
    self: j.self,
    project: j.fields.project.self,
    priority: j.fields?.priority?.name,
    status: j.fields?.status?.name,
    summary: j.summary,
    assignee: j.fields.assignee?.email,
    reporter: j.fields?.reporter?.email,
    comments: allComments ( j )
  }
}
export function allComments ( j: JiraIssue ) {
  return j.fields.comment.comments
    .map ( c => fromJiraDocOrString ( c.body ) ).join ( '\n' )
}
export function fromJiraDocOrString ( d: JiraDoc | string ): string {
  return typeof d === 'string' ? d : getAllParagraphContent ( d )
}
export function indexJiraProject ( ic: IndexingContext, tc: IndexParentChildTc<JiraProjectDetail, JiraIssue, JiraIssuePaging>, indexer: Indexer<JiraIndexedIssue>, executeOptions: ExecuteIndexOptions ) {
  const indexerForProject = indexParentChild ( ic.parentChildLogAndMetrics,
    tc, JiraIssuePagingTc,
    jiraIssueToIndexedJiraIssue,
    ( projectkey, issue ) => `${projectkey}_${issue.id}`,
    executeOptions ) ( indexer )
  return async ( projectkey: string ) => {
    await indexerForProject ( projectkey )
  }

}

export function indexJiraFully ( nf: IndexTreeNonFunctionals,
                                 ic: IndexingContext,
                                 issueIndexer: ( fileTemplate: string, indexId: string ) => Indexer<JiraIndexedIssue>,
                                 memberIndexer: ( fileTemplate: string, indexId: string ) => Indexer<any>,
                                 executeOptions: ExecuteIndexOptions ) {
  return async ( jira: JiraDetails ) => {
    const { jiraProjectsForestTc, jiraProjectToIssueTc } = jiraTcs ( nf, ic, jira )
    const indexer = indexForestOfTrees ( ic.forestLogAndMetrics, jiraProjectsForestTc, JiraProjectPagingTc,
      _ => indexJiraProject ( ic, jiraProjectToIssueTc, issueIndexer ( jira.file, jira.index ), executeOptions ) )
    await indexer ( '/' )// THere isn't really a root for Jira.
  }

}
