import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { consoleIndexParentChildLogAndMetrics, fetchArrayWithPaging, FetchArrayWithPagingType, fetchOneItem } from "@itsmworkbench/indexing";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";
import { JiraIssuePagingTc } from "@itsmworkbench/indexing_jira";
import { NameAnd } from "@laoban/utils";

export function addJiraUsersCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'jirausers <project>',
    description: 'finds the jira users in the project',
    options: {

      '-j, --jira <jira>': { description: 'Jira base url', default: 'https://jira.eon.com/' },
      '-t, --token <token>': { description: 'Variable name that holds the jira token', default: 'JIRA_PROD' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the data` }
    },
    action: async ( _, opts, project ) => {
      console.log ( `Jira users`, project, opts )
      const apiToken = tc.context.env[ opts.token.toString () ]
      if ( !apiToken ) throw Error ( `Need Environment variable for jira token ${opts.token}` )
      const headers = { Authorization: `Bearer ${apiToken}` }
      const fArray: FetchArrayWithPagingType = fetchArrayWithPaging<any> ( tc.context.fetch, consoleIndexParentChildLogAndMetrics, JiraIssuePagingTc, defaultRetryPolicy );
      const fOne = fetchOneItem ( tc.context.fetch )
      let url = `${opts.jira?.toString ()}rest/api/2/project/${project}`;
      if ( opts.debug ) console.log ( `url`, url, JSON.stringify ( headers, null, 2 ) )
      const projectJson = await fOne<any> ( url, { headers } )
      if ( opts.debug ) console.log ( JSON.stringify ( projectJson, null, 2 ) )
      const roles: NameAnd<string> = projectJson.roles || {}
      if ( opts.debug ) console.log ( "roles", JSON.stringify ( roles, null, 2 ) )
      const allUsers: any[] = []
      for ( const [ role, roleUrl ] of Object.entries ( roles ) ) {
        if ( opts.debug ) console.log ( `Role ${role}`, roleUrl )
        const users = await fOne<any> ( roleUrl, { headers } )
        if ( users.actors.length > 0 ) {
          let actors = users.actors.map ( a => `${role}: ${a.displayName}: ${a.type}` );
          allUsers.push ( ...actors )
          if ( opts.debug ) console.log ( `Users for role ${role}`, JSON.stringify ( actors ), null, 2 )
        }
      }
      allUsers.forEach ( u => console.log ( u ) )

    }
  }
}

export function jiraCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                               cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    addJiraUsersCommand<Commander, Config, CleanConfig> ( tc ),
  ] )
}

