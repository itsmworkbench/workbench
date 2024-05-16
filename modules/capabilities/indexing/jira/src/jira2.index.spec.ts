import { indexJiraFully, indexJiraProject, indexJiraProjectsForActors, JiraDetails, JiraProjectToIssueTc, jiraProjectToMembersTc } from "./jira.index";
import { defaultAuthFn, defaultIndexTreeNfs, FetchFnResponse, IndexingContext, rememberForestLogsAndMetrics, rememberIndex, rememberIndexParentChildLogsAndMetrics, rememberIndexTreeLogAndMetrics, stopNonFunctionals } from "@itsmworkbench/indexing";
import fetch from "node-fetch";
import { NameAnd } from "@laoban/utils";

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
const jiraDetails: JiraDetails = {
  baseurl: "http://localhost:8080/",
  apiVersion: "2",
  auth: {
    method: 'Basic',
    credentials: {
      username: 'phil.rice',
      password: 'JIRA_LOCAL_TOKEN'
    }
  },
  index: 'jira',
  aclIndex: 'jira-acl',
  file: 'jira-file'
}
describe ( "jira integration spec for jira 2 (localhost)", () => {
  beforeEach ( () => {
    msgs.length = 0
    remember.length = 0
  } )
  afterAll ( () => {
    // Code to tear down your test environment, e.g., closing a database connection
    stopNonFunctionals ( nfs )
  } );
  it ( "should index a single project", async () => {
    const tc = JiraProjectToIssueTc ( indexContext, jiraDetails )
    const indexer = indexJiraProject ( indexContext, tc, rememberIndex ( '', remember ), {} )
    await indexer ( 'KAN' )
    expect ( remember ).toEqual ( [
      "Started:  KAN",
      "Processing:  KAN - KAN_10000 - {\"id\":\"10000\",\"self\":\"http://localhost:8080/rest/api/2/issue/10000\",\"project\":\"http://localhost:8080/rest/api/2/project/10000\",\"priority\":\"Medium\",\"status\":\"To Do\",\"comments\":\"Comment 1\\nComment 2\\nComment 3\\nComment 4\"}",
      "Finished:  KAN"
    ] )
    expect ( msgs ).toEqual ( [
      "parentId: KAN, page: Page: 0..1 of undefined",
      "parent: KAN, page: Page: 0..1 of undefined, children: KAN_10000",
      "finishedParent: KAN"
    ] )
  } )
  it ( "should index people ", async () => {
    const tc = jiraProjectToMembersTc ( indexContext, jiraDetails )
    const indexer = indexJiraProjectsForActors ( indexContext, tc, async name => {remember.push ( `actor: ${name}` )},
      async ( name ) => {remember.push ( `group: ${name}` )},
      async ( name, type ) => {remember.push ( `unknown role: ${name} / ${type}` )} )
    await indexer ( 'KAN' )
    expect ( remember ).toEqual ( [
      "asd"
    ] )
    expect ( msgs ).toEqual ( [] );
  } )

  it ( "should index jira fully", async () => {
    const indexer = indexJiraFully ( nfs, indexContext,
      ( fileTemplate: string, indexId: string ) => rememberIndex ( 'file', remember ),
      ( fileTemplate: string, indexId: string ) => rememberIndex ( 'member', remember ),
      {} )
    await indexer ( jiraDetails )
    expect ( remember ).toEqual ( [
      "Started: file KAN",
      "Processing: file KAN - KAN_10000 - {\"id\":\"10000\",\"self\":\"http://localhost:8080/rest/api/2/issue/10000\",\"project\":\"http://localhost:8080/rest/api/2/project/10000\",\"priority\":\"Medium\",\"status\":\"To Do\",\"comments\":\"Comment 1\\nComment 2\\nComment 3\\nComment 4\"}",
      "Finished: file KAN"
    ] )
    expect ( msgs ).toEqual ( [
      "rootIds:  - KAN",
      "parentId: KAN, page: Page: 0..1 of undefined",
      "parent: KAN, page: Page: 0..1 of undefined, children: KAN_10000",
      "finishedParent: KAN",
      "finished Root: /"
    ] )
  } )
} )