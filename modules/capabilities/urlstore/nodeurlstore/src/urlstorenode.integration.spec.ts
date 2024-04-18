import fs from "fs";
import { GitOps } from "@itsmworkbench/git";
import { shellGitsops } from "@itsmworkbench/shellgit";
import { loadFromString, orThrow, parseIdentityUrlOrThrow, parseNamedUrlOrThrow } from "@itsmworkbench/urlstore";
import { orgToDetails, testDir } from "./integration.fixture";
import { loadFromIdentityUrl, loadFromNamedUrl } from "./node.urlstore.load";
import { saveNamedUrl } from "./node.urlstore.save";
import path from "path";
import { nodeUrlstore } from "./node.urlstore";

describe ( "loadFromNamedUrl and loadFromIdentityUrl integration test", () => {
  beforeEach ( async () =>
    fs.promises.rm ( await testDir, { recursive: true } ).catch ( e => console.log ( 'ignore error', e ) ) )

  it ( "should add a file to a new repo, commit it, change it and get both old and new values", async () => {
    const repoPath = await testDir.then ( d => d + '/org1' )
    const fileInRepoPath = 'namespace/path/file1.txt'
    const filePath = repoPath + '/' + fileInRepoPath
    const gitOps: GitOps = await shellGitsops ()
    await gitOps.init ( repoPath ) // creates a new repo including the directory
    console.log ( 'inited', filePath )
    await fs.promises.mkdir ( path.dirname ( filePath ), { recursive: true } )
    console.log ( 'making file', filePath )//making file C:/git/IntelliMaintain/tests/git/org1/namespace/path/file1.txt
    await fs.promises.writeFile ( filePath, 'hello' )
    await gitOps.commit ( repoPath, 'initial commit' )
    console.log ( 'commit' )
    const helloHash = await gitOps.hashFor ( repoPath, fileInRepoPath )
    console.log ( 'helloHash', helloHash )
    await fs.promises.writeFile ( filePath, 'goodbye' )
    await gitOps.commit ( repoPath, 'second commit' )
    console.log ( 'commit2' )
    const goodbyeHash = await gitOps.hashFor ( repoPath, fileInRepoPath )
    console.log ( 'goodbyeHash', goodbyeHash )

    //---
    const config = orgToDetails ( await testDir )
    console.log ( 'config', config )
    const loaded1 = orThrow ( await loadFromNamedUrl ( gitOps, config ) ( parseNamedUrlOrThrow ( "itsm/org1/ns1/file1" ) ) )
    expect ( loaded1 ).toEqual ( {
      "url": "itsm/org1/ns1/file1",
      "result": "goodbye_parsed",
      "fileSize": 7,
      "mimeType": "text/plain",
      "id": "itsmid/org1/ns1/a21e91b14c870770cf612020a0619a90d987df4c",
    } )
    const loaded2 = orThrow ( await loadFromIdentityUrl ( gitOps, config ) ( parseIdentityUrlOrThrow ( loaded1.id ) ) )
    expect ( loaded2 ).toEqual ( {
      "url": "itsmid/org1/ns1/a21e91b14c870770cf612020a0619a90d987df4c",
      "result": "goodbye_parsed",
      "mimeType": "text/plain",
      "id": "itsmid/org1/ns1/a21e91b14c870770cf612020a0619a90d987df4c",
    } )
    const loaded3 = orThrow ( await loadFromIdentityUrl ( gitOps, config ) ( parseIdentityUrlOrThrow ( "itsmid/org1/ns1/" + helloHash ) ) )
    expect ( loaded3 ).toEqual ( {
      "id": "itsmid/org1/ns1/b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0",
      "mimeType": "text/plain",
      "result": "hello_parsed",
      "url": "itsmid/org1/ns1/b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0"
    } )
  } )
} )

describe ( "saveNamedUrl", () => {
  beforeEach ( async () =>
    fs.promises.rm ( await testDir, { recursive: true } ).catch ( e => console.log ( 'ignore error', e ) ) )

  it ( "should create files and commit them", async () => {
    const repoPath = await testDir.then ( d => d + '/org1Repo' )
    const fileInRepoPath = 'ns1/file1.txt'
    const filePath = repoPath + '/' + fileInRepoPath
    const gitOps: GitOps = await shellGitsops ()

    console.log ( 'inited', filePath )


    const store = nodeUrlstore ( gitOps, orgToDetails ( await testDir ) )

    let named = parseNamedUrlOrThrow ( "itsm/org1/ns1/file1" );
    const result1 = await store.save ( named, "hello" )
    expect ( result1 ).toEqual ( {
      "fileSize": 13,
      "id": "itsmid/org1/ns1/875376a87df56c0d460b4039e470c3f269f32257",
      "url": "itsm/org1/ns1/file1"
    } )
    const result2 = await store.save ( named, "goodbye" )
    expect ( result2 ).toEqual ( {
      "fileSize": 15,
      "id": "itsmid/org1/ns1/919a09a06a17d2471fbe31a3a0c1f16f88f13a15",
      "url": "itsm/org1/ns1/file1"
    } )
    console.log ( 'getting goodbye1' )

    const goodbye1 = await loadFromString ( store, "itsm/org1/ns1/file1" )
    expect ( goodbye1 ).toEqual ( {
      "fileSize": 15,
      "id": "itsmid/org1/ns1/919a09a06a17d2471fbe31a3a0c1f16f88f13a15",
      "mimeType": "text/plain",
      "result": "goodbye_written_parsed",
      "url": "itsm/org1/ns1/file1"
    } )

    console.log ( 'getting goodbye2' )
    const goodbye2 = await loadFromString ( store, "itsmid/org1/ns1/875376a87df56c0d460b4039e470c3f269f32257" )
    expect ( goodbye2 ).toEqual ( {
      "id": "itsmid/org1/ns1/875376a87df56c0d460b4039e470c3f269f32257",
      "mimeType": "text/plain",
      "result": "hello_written_parsed",
      "url": "itsmid/org1/ns1/875376a87df56c0d460b4039e470c3f269f32257"
    } )
    const loadedHello = await loadFromString ( store, "itsmid/org1/ns1/919a09a06a17d2471fbe31a3a0c1f16f88f13a15" )
    expect ( loadedHello ).toEqual ( {
      "id": "itsmid/org1/ns1/919a09a06a17d2471fbe31a3a0c1f16f88f13a15",
      "mimeType": "text/plain",
      "result": "goodbye_written_parsed",
      "url": "itsmid/org1/ns1/919a09a06a17d2471fbe31a3a0c1f16f88f13a15"
    } )
  } )
} )

describe ( "list", () => {

  it ( "should have files and dirs", async () => {
    const gitOps: GitOps = await shellGitsops ()
    const store = nodeUrlstore ( gitOps, orgToDetails ( await testDir ) )
    const dir1 = (await testDir) + '/org1/namespace/path/somedir1'
    const dir2 = (await testDir) + '/org1/namespace/path/somedir2'
    await fs.promises.mkdir ( dir1, { recursive: true } )
    await fs.promises.mkdir ( dir2, { recursive: true } )
    const list = await store.list ( { org: 'org1', namespace: 'ns1', pageQuery: { page: 1, pageSize: 10 }, order: 'name' } )

    expect ( list ).toEqual ( {
      "org": "org1",
      "namespace": "ns1",
      "dirs": [ "somedir1", "somedir2" ],
      "names": [ "file1" ],
      "page": 1,
      "total": 1,
    } )

  } )

} )

describe ( 'folders', () => {
  it ( 'should list folders when no path specified', async () => {
    const dir1 = (await testDir) + '/org1/namespace/path/somedir1'
    const dir2 = (await testDir) + '/org1/namespace/path/somedir2'
    await fs.promises.mkdir ( dir1, { recursive: true } )
    await fs.promises.mkdir ( dir2, { recursive: true } )
    const gitOps: GitOps = await shellGitsops ()
    const store = nodeUrlstore ( gitOps, orgToDetails ( await testDir ) )
    const folders = await store.folders ( 'org1', 'ns1' )
    expect ( folders ).toEqual ( {
      "name": "path",
      "children": [
        { "name": "somedir1", "children": [], },
        { "name": "somedir2", "children": [], }
      ],
    } )
  } )
  it ( 'should list folders when path specified', async () => {
    const dir1 = (await testDir) + '/org1/namespace/path/somedir1'
    const dir11 = (await testDir) + '/org1/namespace/path/somedir1/one'
    const dir12 = (await testDir) + '/org1/namespace/path/somedir1/two'
    await fs.promises.mkdir ( dir1, { recursive: true } )
    await fs.promises.mkdir ( dir11, { recursive: true } )
    await fs.promises.mkdir ( dir12, { recursive: true } )
    const gitOps: GitOps = await shellGitsops ()
    const store = nodeUrlstore ( gitOps, orgToDetails ( await testDir ) )
    const folders = await store.folders ( 'org1', 'ns1', 'somedir1' )
    expect ( folders ).toEqual ( {
      "name": "somedir1",
      "children": [
        { "name": "one", "children": [], },
        { "name": "two", "children": [], }
      ],
    } )
  } )
} )