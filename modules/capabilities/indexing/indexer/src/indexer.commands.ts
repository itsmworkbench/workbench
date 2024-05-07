import { CommandDetails, ContextConfigAndCommander, SubCommandDetails } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { hasErrors, NameAnd } from "@laoban/utils";
import { cleanAndEnrichConfig, PopulatedIndexItem } from "@itsmworkbench/indexconfig";
import { defaultIndexingContext, ExecuteIndexOptions, IndexTreeNonFunctionals, insertIntoFileWithNonFunctionals, stopNonFunctionals } from "@itsmworkbench/indexing";
import { indexAll } from "@itsmworkbench/indexall/src/index.all";

async function getConfig<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>, file: string | boolean ) {
  const yamlFile = await tc.context.fileOps.loadFileOrUrl ( file.toString () )
  const config = tc.context.yaml.parser ( yamlFile )
  if ( hasErrors ( config ) ) {
    config.forEach ( l => console.log ( l ) )
    process.exit ( 2 )
  }
  const actualConfig: NameAnd<PopulatedIndexItem> = cleanAndEnrichConfig ( config, {} )
  return actualConfig;
}
function findExecuteOptions ( opts: NameAnd<string | boolean> ): ExecuteIndexOptions {
  if ( opts.detailedDryRun ) return { dryRunDoEverythingButIndex: true }
  if ( opts.dryrun ) return { dryRunJustShowTrees: true }
  return {}
}
export function addIndexCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'index',
    description: 'starts indexing',
    options: {
      '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },
      '-t,--target <target>': { description: 'where we put the indexed data', default: 'target/indexer' },
      '--debug': { description: 'Show debug information' },
      '--dryrun': { description: `don't actually do the indexing, but report what would be done` },
      '--detailedDryRun': { description: `don't actually do the indexing, but report what would be done` },
    },
    action: async ( _, opts ) => {
      console.log ( `Indexing `, opts )
      const { file, debug, dryrun, target } = opts
      const config = await getConfig ( tc, file );
      const ic = defaultIndexingContext ( tc.context.env, tc.context.fetch )
      const executeOptions = findExecuteOptions ( opts )
      const indexIntoFile = ( nfc: IndexTreeNonFunctionals ) => ( fileTemplate: string,index: string ) =>
        insertIntoFileWithNonFunctionals ( target.toString (),fileTemplate, index, nfc )
      const resultsAndNfcs = indexAll ( ic, indexIntoFile, executeOptions ) ( config )
      for ( const { result, nfc } of resultsAndNfcs ) {
        await result
      }
      for ( const { result, nfc } of resultsAndNfcs ) {
        stopNonFunctionals ( nfc )
      }
      console.log ( 'done' )
    }
  }
}
export function addConfigCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'config',
    description: 'shows the config',
    options: {
      '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },
    },
    action: async ( _, opts ) => {
      console.log ( `Indexing `, opts )
      const { file, debug, dryrun } = opts
      const config = await getConfig ( tc, file );
      console.log ( JSON.stringify ( config, null, 2 ) )
    }
  }
}
export function indexerCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): SubCommandDetails<Commander, IndexerContext, Config> {
  return {
    cmd: 'index',
    description: 'Commands that index things',
    commands: [
      addConfigCommand<Commander, Config, CleanConfig> ( tc ),
      addIndexCommand<Commander, Config, CleanConfig> ( tc ),
    ]
  }
}
