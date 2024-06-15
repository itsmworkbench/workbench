import { indexJiraFully, indexJiraProject, JiraDetails, JiraProjectToIssueTc } from "./jira.index";
import { defaultAuthFn, defaultIndexTreeNfs, FetchFnResponse, IndexingContext, rememberForestLogsAndMetrics, rememberIndex, rememberIndexParentChildLogsAndMetrics, rememberIndexTreeLogAndMetrics, stopNonFunctionals } from "@itsmworkbench/indexing";
import fetch from "node-fetch";
import { NameAnd } from "@laoban/utils";
import { DateTimeService } from "@itsmworkbench/utils";

const msgs: string[] = []
const remember: string[] = []
let fetchFn = async ( url, options ) => {
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
};
export const indexContext: IndexingContext = {
  timeService: DateTimeService,
  authFn: defaultAuthFn ( process.env, fetchFn, DateTimeService ),
  treeLogAndMetrics: rememberIndexTreeLogAndMetrics ( msgs ),
  forestLogAndMetrics: rememberForestLogsAndMetrics ( msgs ),
  parentChildLogAndMetrics: rememberIndexParentChildLogsAndMetrics ( msgs ),
  fetch: fetchFn
}
const nfs = defaultIndexTreeNfs ();
const jiraDetails: JiraDetails = {
  baseurl: "https://validoc.atlassian.net/",
  apiVersion: "3",
  auth: {
    method: 'Basic',
    credentials: {
      username: 'phil.rice@validoc.org',
      password: 'JIRA_TOKEN'
    }
  },
  index: 'jira',
  aclIndex: 'jira-acl',
  file: 'jira-file'
}
describe ( "jira integration spec for jira3 (validox.atlassian.net)", () => {
  beforeEach ( () => {
    msgs.length = 0
    remember.length = 0
  } )
  afterAll ( () => {
    // Code to tear down your test environment, e.g., closing a database connection
    stopNonFunctionals ( nfs )
  } );
  it ( "should index a single project", async () => {
    const tc = JiraProjectToIssueTc ( indexContext, jiraDetails, undefined )
    const indexer = indexJiraProject ( indexContext, tc, rememberIndex ( '', remember ), { since: '1d' } )
    await indexer ( 'KAN' )
    expect ( remember ).toEqual ( [
      "Started:  KAN",
      "Processing:  KAN - KAN_10001 - {\"id\":\"10001\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10001\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"To Do\",\"comments\":\"\"}",
      "Processing:  KAN - KAN_10000 - {\"id\":\"10000\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10000\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"Done\",\"comments\":\"My first comment\\nMy second comment\\nComment 3\\nComment 4\\nComment 5\\nComment 6\\nComment 7\\nComment 8\\nComment 9\\nComment 10\\nComment 11\\nComment 12\\nComment 13\\nComment 14\"}",
      "Finished:  KAN"
    ] )
    expect ( msgs ).toEqual ( [
      "parentId: KAN, page: Page: 0..1 of undefined",
      "parent: KAN, page: Page: 0..1 of undefined, children: KAN_10001",
      "parentId: KAN, page: Page: 1..2 of 2",
      "parent: KAN, page: Page: 1..2 of 2, children: KAN_10000",
      "finishedParent: KAN"
    ] )

  } )
  it ( "should index jira fully", async () => {
    const indexer = indexJiraFully ( nfs, indexContext,
      ( fileTemplate: string, indexId: string ) => rememberIndex ( 'file', remember ),
      { since: '1d' } )
    await indexer ( jiraDetails )
    expect ( remember ).toEqual ( [
      "Started: file KAN",
      "Processing: file KAN - KAN_10001 - {\"id\":\"10001\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10001\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"To Do\",\"comments\":\"\"}",
      "Processing: file KAN - KAN_10000 - {\"id\":\"10000\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10000\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"Done\",\"comments\":\"My first comment\\nMy second comment\\nComment 3\\nComment 4\\nComment 5\\nComment 6\\nComment 7\\nComment 8\\nComment 9\\nComment 10\\nComment 11\\nComment 12\\nComment 13\\nComment 14\"}",
      "Finished: file KAN"
    ] )
    expect ( msgs ).toEqual ( [
      "rootIds:  - KAN",
      "parentId: KAN, page: Page: 0..1 of undefined",
      "parent: KAN, page: Page: 0..1 of undefined, children: KAN_10001",
      "parentId: KAN, page: Page: 1..2 of 2",
      "parent: KAN, page: Page: 1..2 of 2, children: KAN_10000",
      "finishedParent: KAN",
      "finished Root: /"
    ] )

  } )
} )