import { defaultAuthFn, defaultIndexTreeNfs, FetchFnResponse, IndexingContext, rememberIndex, rememberIndexTreeLogAndMetrics, stopNonFunctionals } from "@itsmworkbench/indexing";
import { githubOneRepoWF } from "@itsmworkbench/indexall/src/index.all";
import { indexGitHubFully, indexGitHubOrganisation, indexGitHubRepo, indexGitHubUser, indexOrganisationMembers } from "./github.index.tree";
import { rememberForestLogsAndMetrics } from "@itsmworkbench/indexing/src/forest.index";
import fetch from 'node-fetch'
import { NameAnd } from "@laoban/utils";
import { indexConfigExample } from "./github.fixture";
import { cleanAndEnrichConfig } from "@itsmworkbench/indexconfig";

const msgs: string[] = []
export const indexContext: IndexingContext = {
  authFn: defaultAuthFn ( process.env ),
  treeLogAndMetrics: rememberIndexTreeLogAndMetrics ( msgs ),
  forestLogAndMetrics: rememberForestLogsAndMetrics ( msgs ),
  fetch: async ( url, options ) => {
    console.log ( `Fetching: ${url}` )
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

describe ( 'githubOneRepoWF', () => {
  beforeEach ( () => {
    msgs.length = 0
  } )
  afterAll ( () => {
    // Code to tear down your test environment, e.g., closing a database connection
    stopNonFunctionals ( nfs )
  } );

  describe ( 'indexrepo', () => {
    it ( 'should index a repo - dryrun true', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubRepo ( nfs, indexContext, rememberIndex ( 'test', remembered ), { dryRunJustShowRepo: true } )
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( 'phil-rice/typescriptDragons' )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: test phil-rice/typescriptDragons",
        "Started: test phil-rice/typescriptDragons"
      ] )
      expect ( msgs.sort () ).toEqual ( [] )
    } )
    it ( 'should index a repo - dryRunDoEverythingButIndex true', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubRepo ( nfs, indexContext, rememberIndex ( 'test', remembered ), { dryRunDoEverythingButIndex: true } )
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( 'phil-rice/typescriptDragons' )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: test phil-rice/typescriptDragons",
        "Started: test phil-rice/typescriptDragons"
      ] )
      expect ( msgs.sort () ).toEqual ( [
        "Finished Folder: ",
        "Finished Leaf: README.md",
        "FolderIds: ",
        "LeafIds: README.md"
      ] )
    } )
    it ( 'should index a repo - dryrun false', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubRepo ( nfs, indexContext, rememberIndex ( 'test', remembered ), {} ) //we actually go for it
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( 'phil-rice/typescriptDragons' )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: test phil-rice/typescriptDragons",
        "Processing: test phil-rice/typescriptDragons - README.md - {\"name\":\"README.md\",\"path\":\"README.md\",\"url\":\"https://api.github.com/repos/phil-rice/typescriptDragons/contents/README.md?ref=main\",\"html_url\":\"https://github.com/phil-rice/typescriptDragons/blob/main/README.md\",\"content\":\"# Dragons kata in typescript\\r\\n\\r\\nAll Dragons, when created, have:\\r\\n\\r\\n* Health, starting at 1000\\r\\n* May be Alive or Dead, starting Alive\\r\\n* Dragons can Deal Damage to Dragons.\\r\\n* The damage they take is subtracted from Health\\r\\n* When damage received exceeds current Health, Health becomes 0 and the dragon dies\\r\\n\\r\\nFor extra points add Logging, and a Metric that counts the number of times a character is damaged.\\r\\n\\r\\n# Step 1\\r\\n\\r\\nLet's create the method to damage the dragon\\r\\n\\r\\n# Step 2\\r\\n\\r\\nLet's display the dragon in a component, with a button and damage the dragon when the button is pressed\\r\\n\"}",
        "Started: test phil-rice/typescriptDragons"
      ] )
      expect ( msgs.sort () ).toEqual ( [
        "Finished Folder: ",
        "Finished Leaf: README.md",
        "FolderIds: ",
        "LeafIds: README.md"
      ] )

    } )

    it ( 'should report not found if a repo not found', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubRepo ( nfs, indexContext, rememberIndex ( 'test', remembered ), { dryRunJustShowRepo: false } ) //we actually go for it
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( 'phil-rice/repodoesntexist' )
      expect ( remembered.sort () ).toEqual ( [
        "Failed: test phil-rice/repodoesntexist Error: Not Found",
        "Started: test phil-rice/repodoesntexist"
      ] )
      expect ( msgs.sort () ).toEqual ( [] )
    } )
  } )
  describe ( 'index org', () => {
    it ( 'should index an org - dryrun on', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubOrganisation ( nfs, indexContext, id => rememberIndex ( id, remembered ), { dryRunJustShowRepo: true } )
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( 'itsmworkbench' )
      expect ( remembered.sort () ).toEqual ( [//we sort because this is very async... so here we just assert that at some time we got these messages
        "Finished: itsmworkbench itsmworkbench/forissues",
        "Finished: itsmworkbench itsmworkbench/workbench",
        "Started: itsmworkbench itsmworkbench/forissues",
        "Started: itsmworkbench itsmworkbench/workbench"
      ] )
      expect ( msgs.sort () ).toEqual ( [
        "finished Root: itsmworkbench",
        "rootIds: itsmworkbench/workbench,itsmworkbench/forissues"
      ] )
    } )
    it ( "should report not found if an org not found", async () => {
      const remembered: string[] = []
      const indexer = indexGitHubOrganisation ( nfs, indexContext, id => rememberIndex ( id, remembered ), { dryRunJustShowRepo: false } )
      await indexer ( 'orgdoesntexist' )
      expect ( remembered.sort () ).toEqual ( [] )
      expect ( msgs.sort () ).toEqual ( [
        "notfound Root: orgdoesntexist"
      ] )
    } )
  } )
  describe ( 'index user repos', () => {
    it ( 'should index people - dryrun on', async () => {
      const remembered: string[] = []
      const indexer = indexGitHubUser ( nfs, indexContext, id => rememberIndex ( id, remembered ), { dryRunJustShowRepo: true } )
      await indexer ( 'phil-rice-HCL' )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: phil-rice-HCL phil-rice-HCL/HelloDataNucleusJBoss",
        "Started: phil-rice-HCL phil-rice-HCL/HelloDataNucleusJBoss"
      ] )
      expect ( msgs.sort () ).toEqual ( [
        "finished Root: phil-rice-HCL",
        "rootIds: phil-rice-HCL/HelloDataNucleusJBoss"
      ] )
    } )
    it ( "should report not found if a user not found", async () => {
      const remembered: string[] = []
      const indexer = indexGitHubUser ( nfs, indexContext, id => rememberIndex ( id, remembered ), { dryRunJustShowRepo: false } )
      await indexer ( 'userdoesntexist999' )
      expect ( remembered.sort () ).toEqual ( [] )
      expect ( msgs.sort () ).toEqual ( [
        "notfound Root: userdoesntexist999"
      ] )
    } )
  } )
  describe ( "indexOrganisationMembers", () => {
    it ( "should index members of an organisation - dryrun on", async () => {
      const remembered: string[] = []
      const indexer = indexOrganisationMembers ( nfs, indexContext, id => rememberIndex ( id, remembered ), { dryRunJustShowRepo: true } )
      await indexer ( 'itsmworkbench' )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: itsmworkbench eyupbarlas",
        "Finished: itsmworkbench phil-rice",
        "Started: itsmworkbench eyupbarlas",
        "Started: itsmworkbench phil-rice"
      ] )
      expect ( msgs.sort () ).toEqual ( [
        "finished Root: itsmworkbench",
        "rootIds: eyupbarlas,phil-rice"
      ] )

    } )
  } )
  describe ( "indexGitHubFully", () => {

    it ( "should say what it is going to do when we dryRunJustShowRepo", async () => {
      const remembered: string[] = []
      const indexer = indexGitHubFully ( nfs, indexContext, ( forestId ) => rememberIndex ( forestId, remembered ), { dryRunJustShowRepo: true } )
      const config = cleanAndEnrichConfig ( indexConfigExample, {} )
      await indexer ( config.github.scan as any )
      expect ( remembered.sort () ).toEqual ( [
        "Finished: itsmworkbench eyupbarlas",
        "Finished: itsmworkbench itsmworkbench/forissues",
        "Finished: itsmworkbench itsmworkbench/workbench",
        "Finished: itsmworkbench phil-rice",
        "Finished: phil-rice-HCL phil-rice-HCL/HelloDataNucleusJBoss",
        "Started: itsmworkbench eyupbarlas",
        "Started: itsmworkbench itsmworkbench/forissues",
        "Started: itsmworkbench itsmworkbench/workbench",
        "Started: itsmworkbench phil-rice",
        "Started: phil-rice-HCL phil-rice-HCL/HelloDataNucleusJBoss"
      ])
      expect(msgs.sort()).toEqual([
        "finished Root: itsmworkbench",
        "finished Root: itsmworkbench",
        "finished Root: phil-rice-HCL",
        "rootIds: eyupbarlas,phil-rice",
        "rootIds: itsmworkbench/workbench,itsmworkbench/forissues",
        "rootIds: phil-rice-HCL/HelloDataNucleusJBoss"
      ])
    } )
  } )
} )