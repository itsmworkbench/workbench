#!/usr/bin/env node

import { Commander12, commander12Tc } from "@itsmworkbench/commander12";
import { cliContext, CliContext, CliTc, CliTcFinder, defaultTo, fileConfig, makeCli } from "@itsmworkbench/cli";
import { fileOpsNode } from "@laoban/filesops-node";
import { CleanConfig, Config, configCommands } from "@itsmworkbench/config";
import { hasErrors, reportErrors } from "@laoban/utils";


import { apiCommand } from "@itsmworkbench/api";
import { YamlCapability } from "@itsmworkbench/yaml";
import { jsYaml } from "@itsmworkbench/jsyaml";


export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}

const context: CliContext = cliContext ( 'intellimaintain', findVersion (), fileOpsNode () )
const cliTc: CliTc<Commander12, CliContext, Config, CleanConfig> = commander12Tc<CliContext, Config, CleanConfig> ()
const configFinder: CliTcFinder<Config, CleanConfig> = fileConfig<CliContext, Config, CleanConfig> ( '.intellimaintain',
  ( c: any ) => c,
  defaultTo ( {}, 'NotFound' ) )

const yaml: YamlCapability = jsYaml ()
makeCli<Commander12, CliContext, Config, CleanConfig> ( context, configFinder, cliTc ).then ( async ( commander ) => {
  if ( hasErrors ( commander ) ) {
    reportErrors ( commander )
    process.exit ( 1 )
  }
  cliTc.addSubCommand ( commander, configCommands ( commander ) )
  cliTc.addCommands ( commander, [ apiCommand ( yaml ) ] )
  return await cliTc.execute ( commander.commander, context.args )
} )


