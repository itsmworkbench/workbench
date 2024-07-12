import { CommandDetails, ContextConfigAndCommander, SubCommandDetails } from "@itsmworkbench/cli";


export function viewConfigCommand<Commander,Context, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander,Context, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'view',
    description: 'View the current configuration',
    options: {},
    action: async () => {
      console.log ( "Config location: ", tc.configFileName ? tc.configFileName : "undefined" );
      console.log ( JSON.stringify ( tc.cliConfigTc.cleanForDisplay ( tc.config ), null, 2 ) );
    }
  }
}
export function configCommands<Commander,Config,  CleanConfig, Context> ( tc: ContextConfigAndCommander<Commander,Context, Config, CleanConfig> ): SubCommandDetails<Commander,Context, Config> {
  return {
    cmd: 'config',
    description: 'Config commands',
    commands: [ viewConfigCommand<Commander,Context, Config, CleanConfig> ( tc ) ]
  }
}
