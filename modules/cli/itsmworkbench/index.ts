#!/usr/bin/env node

import { Commander12, commander12Tc } from "@itsmworkbench/commander12";
import { cliContext, CliContext, CliTc, CliTcFinder, defaultTo, fileConfig, makeCli } from "@itsmworkbench/cli";
import { fileOpsNode } from "@laoban/filesops-node";
import { CleanConfig, Config, configCommands } from "@itsmworkbench/config";
import { hasErrors, reportErrors } from "@laoban/utils";


import { apiCommand } from "@itsmworkbench/api";
import { YamlCapability } from "@itsmworkbench/yaml";
import { jsYaml } from "@itsmworkbench/jsyaml";
import { HasAiCapabilities } from "@itsmworkbench/ai";
import { chatgptAi } from "@itsmworkbench/chatgptai";


export function findVersion () {
  let packageJsonFileName = "../package.json";
  try {
    return require ( packageJsonFileName ).version
  } catch ( e ) {
    return "version not known"
  }
}

type ItsmContext = CliContext & HasAiCapabilities

const context: ItsmContext = {
  ...cliContext ( 'intellimaintain', findVersion (), fileOpsNode () ),
  ais: {
    gpt: chatgptAi (),
    // mistral: mistralAi ()
  }
}


const cliTc: CliTc<Commander12, ItsmContext, Config, CleanConfig> = commander12Tc<ItsmContext, Config, CleanConfig> ()
const configFinder: CliTcFinder<Config, CleanConfig> = fileConfig<ItsmContext, Config, CleanConfig> ( '.intellimaintain',
  ( c: any ) => c,
  defaultTo ( {}, 'NotFound' ) )

const yaml: YamlCapability = jsYaml ()
makeCli<Commander12, ItsmContext, Config, CleanConfig> ( context, configFinder, cliTc ).then ( async ( commander ) => {
  if ( hasErrors ( commander ) ) {
    reportErrors ( commander )
    process.exit ( 1 )
  }
  cliTc.addSubCommand ( commander, configCommands ( commander ) )
  cliTc.addCommands ( commander, [ apiCommand ( yaml ) ] )
  return await cliTc.execute ( commander.commander, context.args )
} )


