#!/usr/bin/env node
import { CliTc, fixedConfig, makeCli } from "@itsmworkbench/cli";
import { Commander12, commander12Tc } from "@itsmworkbench/commander12";
import { hasErrors, NameAnd, reportErrors } from "@laoban/utils";
import { IndexerContext } from "./src/context";
import { jsYaml } from "@itsmworkbench/jsyaml";
import { fileOpsNode } from "@laoban/filesops-node";
import { indexerCommands } from "./src/indexer.commands";
import fetch from "node-fetch";
import { FetchFnResponse } from "@itsmworkbench/indexing";

export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}

export type NoConfig = {}

const makeContext = (): IndexerContext => ({
  version: findVersion (), name: 'indexer', yaml: jsYaml (),
  currentDirectory: process.cwd (),
  env: process.env, args: process.argv, fileOps: fileOpsNode (),
  fetch: async ( url, options ) => {
    console.log ( `Fetching: ${url}` )
    const res = await fetch ( url, options );
    const headers: NameAnd<string> = {}
    res.headers.forEach ( ( value, name ) => {
      headers[ name ] = value
    } )
    if (res.status===403){
      console.log('403')
      console.log(await res.text())
    }
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
})
export const cliTc: CliTc<Commander12, IndexerContext, NoConfig, NoConfig> = commander12Tc<IndexerContext, NoConfig, NoConfig> ()
export const configFinder = fixedConfig<NoConfig> ( makeContext )
makeCli<Commander12, IndexerContext, NoConfig, NoConfig> ( makeContext (), configFinder, cliTc ).then ( async ( commander ) => {
  if ( hasErrors ( commander ) ) {
    reportErrors ( commander )
    process.exit ( 1 )
  }
  cliTc.addSubCommand ( commander, indexerCommands ( commander ) )
  return await cliTc.execute ( commander.commander, process.argv )
} )