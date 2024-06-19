import { allMembers, allMembersOfGroup } from "@itsmworkbench/indexing_entraid";
import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { consoleIndexParentChildLogAndMetrics, defaultIndexingContext, nullIndexParentChildLogAndMetrics } from "@itsmworkbench/indexing";
import { getIndexerFile } from "./indexer.commands";
import { NameAnd } from "@laoban/utils";


export function addMembersComment<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'members <filter>',
    description: 'finds all the members that match the filter. Example filter displayName eq \'JIRA_ME8_DEVELOPER\'',
    options: {
      '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },
      '-g, --group': { description: 'the filter is actually a group name' },
      '-i, --index <index>': { description: 'The index that holds the entra id credentials', default: 'jiraAcl' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the mapping` }
    },
    action: async ( _, opts, filter ) => {
      console.log ( `Opts`, opts )
      console.log ( 'filter', filter )
      const metrics: NameAnd<number> = {}

      const ic = defaultIndexingContext ( tc.context.env, tc.context.fetch, metrics )
      const config = await getIndexerFile ( tc, opts.file.toString () );
      const index = config[ opts.index.toString () ]
      if ( !index ) throw Error ( `Cannot find index ${opts.index}. Legal values are ${Object.keys ( config )}` )
      const auth = await ic.authFn ( index.scan.entraId )
      console.log ( 'auth', auth )
      const log = opts.debug ? consoleIndexParentChildLogAndMetrics : nullIndexParentChildLogAndMetrics
      if ( opts.group ) {
        for await ( const { group, member } of allMembers ( tc.context.fetch, auth, log, filter ) ) {
          console.log ( group.displayName, group.id, member.mail, member.id )
        }
      } else {
        for await ( const member of allMembersOfGroup ( tc.context.fetch, auth, log, filter ) ) {
          console.log ( member.mail )
        }
      }

    }
  }
}
export function entraIdCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                  cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    addMembersComment<Commander, Config, CleanConfig> ( tc ),
  ] )
}


