import { defaultAuthFn, defaultIndexTreeNfs, FetchFnResponse, IndexingContext, rememberForestLogsAndMetrics, rememberIndex, rememberIndexParentChildLogsAndMetrics, rememberIndexTreeLogAndMetrics, stopNonFunctionals } from "@itsmworkbench/indexing";
import fetch from "node-fetch";
import { NameAnd } from "@laoban/utils";
import { GitlabDetails, GitlabProject, gitlabProjectsTc, gitlabRepoTc, indexGitlabFully, indexGitlabProjects, indexGitlabRepo } from "./gitlab.index";

const msgs: string[] = []
const remember: string[] = []
export const indexContext: IndexingContext = {
  authFn: defaultAuthFn ( process.env ),
  treeLogAndMetrics: rememberIndexTreeLogAndMetrics ( msgs ),
  forestLogAndMetrics: rememberForestLogsAndMetrics ( msgs ),
  parentChildLogAndMetrics: rememberIndexParentChildLogsAndMetrics ( msgs ),
  fetch: async ( url, options ) => {
    const res = await fetch ( url, options );
    const headers: NameAnd<string> = {}
    res.headers.forEach ( ( value, name ) => {
      headers[ name ] = value
    } )
    const result: FetchFnResponse = {
      status: res.status,
      ok: res.ok,
      json: () => res.json (),
      text: () => res.text (),
      headers,
      statusText: res.statusText
    }
    return result;
  }
}
const nfs = defaultIndexTreeNfs ();
const gitlabDetails: GitlabDetails = {
  baseurl: "https://gitlab.com/",
  index: 'gitlab',
  file: 'gitlab-file',
  aclIndex: 'gitlab-acl',
  projects: ['validoc'],
  auth: {
    method: 'PrivateToken',
    credentials: {
      token: 'GITLAB_TOKEN'
    }
  },
}

const project: GitlabProject = {
  "id": 57819826,
  "default_branch": "main",

}
describe ( "gitlab integration spec", () => {
  beforeEach ( () => {
    msgs.length = 0
    remember.length = 0
  } )
  afterAll ( () => {
    // Code to tear down your test environment, e.g., closing a database connection
    stopNonFunctionals ( nfs )
  } );


  it ( "should index the projects", async () => {
    const tc = gitlabProjectsTc ( indexContext, gitlabDetails )
    const indexer = indexGitlabProjects ( indexContext, tc, async p => {remember.push ( `${p.id}/${p.default_branch}` )} )
    await indexer ( 'validoc' )
    expect ( remember ).toEqual ( [
      "57819826/main"
    ] )
    expect ( msgs ).toEqual ( [
      "rootIds: No more pages available - 57819826/main",
      "finished Root: validoc"
    ] )
  } )

  it ( "should index one repo", async () => {
    const tc = gitlabRepoTc ( indexContext, gitlabDetails )
    const indexer = indexGitlabRepo ( indexContext, gitlabDetails, tc, rememberIndex ( '', remember ), {} )
    await indexer ( project )
    expect ( remember ).toEqual ( [
      "Started:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true",
      "Processing:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true - 0a6a749b5f94e63594d43528ac2abce52d15f981 - {\"projectId\":57819826,\"id\":\"0a6a749b5f94e63594d43528ac2abce52d15f981\",\"path\":\"README.md\",\"content\":\"Example readme file\"}",
      "Finished:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true"
    ] )
    expect ( msgs ).toEqual ( [
      "parentId: api/v4/projects/57819826/repository/tree?ref=main&recursive=true, page: No more pages available",
      "parent: api/v4/projects/57819826/repository/tree?ref=main&recursive=true, page: No more pages available, children: 0a6a749b5f94e63594d43528ac2abce52d15f981",
      "finishedParent: api/v4/projects/57819826/repository/tree?ref=main&recursive=true"
    ] )
  } )

  it ( "should indexGitlabFully", async () => {
    const indexer = indexGitlabFully ( nfs, indexContext,
      ( file, index ) => rememberIndex ( `${file}/${index}: `, remember ), {} )
    await indexer ( gitlabDetails )

    expect ( remember ).toEqual ( [
      "Started: gitlab-file/gitlab:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true",
      "Processing: gitlab-file/gitlab:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true - 0a6a749b5f94e63594d43528ac2abce52d15f981 - {\"projectId\":57819826,\"id\":\"0a6a749b5f94e63594d43528ac2abce52d15f981\",\"path\":\"README.md\",\"content\":\"Example readme file\"}",
      "Finished: gitlab-file/gitlab:  api/v4/projects/57819826/repository/tree?ref=main&recursive=true"
    ])
    expect ( msgs ).toEqual ( [
      "rootIds: No more pages available - 57819826/main",
      "parentId: api/v4/projects/57819826/repository/tree?ref=main&recursive=true, page: No more pages available",
      "parent: api/v4/projects/57819826/repository/tree?ref=main&recursive=true, page: No more pages available, children: 0a6a749b5f94e63594d43528ac2abce52d15f981",
      "finishedParent: api/v4/projects/57819826/repository/tree?ref=main&recursive=true",
      "finished Root: validoc"
    ] )
  })
} )