import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { consoleIndexParentChildLogAndMetrics, defaultAuthFn, fetchArrayWithPaging, FetchArrayWithPagingType, fetchOneItem } from "@itsmworkbench/indexing";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";
import { JiraIssuePagingTc } from "@itsmworkbench/indexing_jira";
import { NameAnd } from "@laoban/utils";
import { getIndexerFile } from "./indexer.commands";
import { DateTimeService } from "@itsmworkbench/utils";

export function authCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'auth <index>',
    description: 'displays the headers associated with authorisation for the index. ',
    options: {
      '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },

      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the data` }
    },
    action: async ( _, opts, index ) => {
      console.log ( `auth`, index, opts )
      const { file, debug, target, api, keep, port } = opts
      const config = await getIndexerFile ( tc, file.toString () );
      const indexDetails = config[ index.toString () ]
      if ( !indexDetails ) throw Error ( `No index details for ${index}.Legal values are ${Object.keys ( config )}` )
      console.log ( 'auth', index, indexDetails?.scan?.auth )
      const headers = await defaultAuthFn ( tc.context.env, tc.context.fetch, DateTimeService ) ( indexDetails?.scan?.auth )
      console.log ( JSON.stringify ( headers, null, 2 ) )
    }
  }
}

export function authCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                               cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    authCommand<Commander, Config, CleanConfig> ( tc ),
  ] )
}

