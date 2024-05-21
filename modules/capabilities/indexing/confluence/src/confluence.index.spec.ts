import { defaultAuthFn, defaultIndexTreeNfs, FetchFnResponse, IndexingContext, rememberForestLogsAndMetrics, rememberIndex, rememberIndexParentChildLogsAndMetrics, rememberIndexTreeLogAndMetrics, stopNonFunctionals } from "@itsmworkbench/indexing";
import fetch from "node-fetch";
import { NameAnd } from "@laoban/utils";
import { ConfluenceDetails, indexConfluenceSpaces } from "./confluence.index";
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
  authFn: defaultAuthFn ( process.env, fetchFn, DateTimeService ),
  treeLogAndMetrics: rememberIndexTreeLogAndMetrics ( msgs ),
  forestLogAndMetrics: rememberForestLogsAndMetrics ( msgs ),
  parentChildLogAndMetrics: rememberIndexParentChildLogsAndMetrics ( msgs ),
  fetch: fetchFn
}
const nfs = defaultIndexTreeNfs ();
const details: ConfluenceDetails = {
  baseurl: "https://confluence.eon.com/",
  auth: {
    method: 'ApiKey',
    credentials: {
      apiKey: 'CONFLUENCE_TOKEN'
    }
  },
  maxSpaces: 2,
  maxPages: 2,
  index: 'confluence',
  aclIndex: 'confluence-acl',
  file: 'confluence-file'
}
describe ( "confluence integration spec", () => {
  beforeEach ( () => {
    msgs.length = 0
    remember.length = 0
  } )
  afterAll ( () => {
    // Code to tear down your test environment, e.g., closing a database connection
    stopNonFunctionals ( nfs )
  } );
  it ( "should index spaces", async () => {
    const indexer = await indexConfluenceSpaces ( indexContext, nfs, ( ft, i ) => rememberIndex ( `${ft} ${i}`, remember ), {} ) ( details )
    expect ( remember ).toEqual ( [] )
    expect ( msgs ).toEqual ( [] )

  } )
  // it ( "should index jira fully", async () => {
  //   const indexer = indexJiraFully ( nfs, indexContext,
  //     ( fileTemplate: string, indexId: string ) => rememberIndex ( 'file', remember ),
  //     ( fileTemplate: string, indexId: string ) => rememberIndex ( 'member', remember ),
  //     {} )
  //   await indexer ( details )
  //   expect ( remember ).toEqual ( [
  //     "Started: file KAN",
  //     "Processing: file KAN - KAN_10001 - {\"id\":\"10001\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10001\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"To Do\",\"comments\":\"\"}",
  //     "Processing: file KAN - KAN_10000 - {\"id\":\"10000\",\"self\":\"https://validoc.atlassian.net/rest/api/3/issue/10000\",\"project\":\"https://validoc.atlassian.net/rest/api/3/project/10000\",\"priority\":\"Medium\",\"status\":\"Done\",\"comments\":\"My first comment\\nMy second comment\\nComment 3\\nComment 4\\nComment 5\\nComment 6\\nComment 7\\nComment 8\\nComment 9\\nComment 10\\nComment 11\\nComment 12\\nComment 13\\nComment 14\"}",
  //     "Finished: file KAN"
  //   ] )
  //   expect ( msgs ).toEqual ( [
  //     "rootIds:  - KAN",
  //     "parentId: KAN, page: Page: 0..1 of undefined",
  //     "parent: KAN, page: Page: 0..1 of undefined, children: KAN_10001",
  //     "parentId: KAN, page: Page: 1..2 of 2",
  //     "parent: KAN, page: Page: 1..2 of 2, children: KAN_10000",
  //     "finishedParent: KAN",
  //     "finished Root: /"
  //   ] )
  //
  // } )
} )