import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { hasErrors, NameAnd } from "@laoban/utils";
import { cleanAndEnrichConfig, PopulatedIndexItem } from "@itsmworkbench/indexconfig";
import { defaultIndexingContext, ExecuteIndexOptions, IndexTreeNonFunctionals, insertIntoFileWithNonFunctionals, stopNonFunctionals } from "@itsmworkbench/indexing";
import { indexAll } from "@itsmworkbench/indexall";
import { startKoa, stopKoa } from "@itsmworkbench/koa";
import { apiKeyHandlers, metricIndexerHandlers } from "./indexer.api";
import { apiKeyDetails, invalidateApiKeysForEmail, loadQueriesForEmail, makeApiKey } from "./apikey.for.dls";

async function getConfig<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>, file: string ) {
  const yamlFile = await tc.context.fileOps.loadFileOrUrl ( file.toString () )
  const config = tc.context.yaml.parser ( yamlFile )
  if ( hasErrors ( config ) ) {
    config.forEach ( l => console.log ( l ) )
    process.exit ( 2 )
  }
  const actualConfig: NameAnd<PopulatedIndexItem> = cleanAndEnrichConfig ( config, {} )
  return actualConfig;
}
function findExecuteOptions ( opts: NameAnd<string | boolean | string[]> ): ExecuteIndexOptions {
  let since = opts.since?.toString ();
  validateSince ( since )
  if ( opts.detailedDryRun ) return { since, dryRunDoEverythingButIndex: true }
  if ( opts.dryrun ) return { since, dryRunJustShowTrees: true }
  return { since }
}
export function validateSince ( since: string | undefined ) {
  if ( since === undefined ) return
  const timePattern = /^(\d+)([ydhm])$/;
  const match = since.match ( timePattern );
  if ( !match ) {
    throw new Error ( `Invalid value for --since option: ${since}. Legal examples include 1y or 1d or 3h or 30s.` );
  }
}
export function addIndexCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'index',
    description: 'starts indexing',
    options: {
      '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },
      '-t,--target <target>': { description: 'where we put the indexed data', default: 'target/indexer' },
      '--debug': { description: 'Show debug information' },
      '--api': { description: 'Start the api' },
      '--since <time>': { description: 'Index only issues updated since the specified time (e.g., 1d for last day, 2h for last 2 hours, 30m for last 30 minutes)' , default: '3600d'},
      '--keep': { description: 'if you started the api this keeps it running at the end' },
      '--port <port>': { description: 'The port to start the api on', default: '1235' },
      '--dryrun': { description: `don't actually do the indexing, but report what would be done` },
      '--detailedDryRun': { description: `don't actually do the indexing, but report what would be done` },
    },
    action: async ( _, opts ) => {
      console.log ( `Indexing `, opts )
      const { file, debug, target, api, keep, port } = opts
      const config = await getConfig ( tc, file.toString () );

      const metrics: NameAnd<number> = {}
      const ic = defaultIndexingContext ( tc.context.env, tc.context.fetch, metrics )
      const executeOptions: ExecuteIndexOptions = findExecuteOptions ( opts )
      const indexIntoFile = ( nfc: IndexTreeNonFunctionals ) => ( fileTemplate: string, index: string ) =>
        insertIntoFileWithNonFunctionals ( target.toString (), fileTemplate, index, nfc )
      const resultsAndNfcs = indexAll ( ic, indexIntoFile, executeOptions ) ( config )
      const allNfcs = resultsAndNfcs.map ( r => r.nfc )
      const apiFuture = api === true ? startKoa ( 'target/indexer', Number.parseInt ( port.toString () ), debug === true,
        metricIndexerHandlers ( metrics, allNfcs ) ) : undefined
      for ( const { result } of resultsAndNfcs ) {
        await result
      }
      for ( const { nfc } of resultsAndNfcs ) {
        stopNonFunctionals ( nfc )
      }
      console.log ( 'done' )
      if ( apiFuture !== undefined ) {
        if ( keep ) console.log ( `still running as api is enabled on port ${port}` )
        else
          stopKoa ( await apiFuture )
      }
    }
  }
}


export function addApiKeyCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'apiKey <email>',
    description: 'returns the api key and query for the email',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-i, --index <index...>': { description: 'The indexes to be accessed by the query for the api key', default: [ 'jira-prod' ] },
      '-u, --username <username>': { description: 'elastic search username', default: 'Indexer_NPA' },
      '--uncontrolled <uncontrolled...>': { description: `The indexes that don't implement DLS`, default: [] },
      '-p, --password <password>': { description: 'Variable name that holds the elastic search password', default: 'ELASTIC_SEARCH_PASSWORD' },
      '-d, --delete-previous': { description: 'invalidate previous' },

      '--dryRun': { description: 'Show what would be done' },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts, email ) => {
      console.log ( 'email', email )
      console.log ( 'opts', opts )
      const details = apiKeyDetails ( opts, tc.context.env )
      console.log ( JSON.stringify ( details, null, 2 ) )
      const queries = await loadQueriesForEmail ( tc.context.fetch, details, email )
      console.log ( JSON.stringify ( queries, null, 2 ) )
      if ( opts.dryRun ) return
      if ( details.deletePrevious ) {
        console.log ( await invalidateApiKeysForEmail ( tc.context.fetch, details ) ( email ) )
      }
      const response = await makeApiKey ( tc.context.fetch, details, email, queries )
      console.log ( response )
    }
  }
}
export function addApiKeyApiCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'apiKeyApi',
    description: 'launches an api to get api keys',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-i, --index <index...>': { description: 'The indexes implementing DLS to be accessed by the query for the api key', default: [ 'jira-prod' ] },
      '--uncontrolled <uncontrolled...>': { description: `The indexes that don't implement DLS`, default: [] },
      '-u, --username <username>': { description: 'elastic search username', default: 'Indexer_NPA' },
      '-p, --password <password>': { description: 'Variable name that holds the elastic search password', default: 'ELASTIC_SEARCH_PASSWORD' },
      '-d, --delete-previous': { description: 'invalidate previous if ask for new' },
      '-s, --secret <secret>': { description: `Optional secret to validate the callers. If set then the caller must provide a bearer token in the authorization header equal to this value. There is only one secret` },
      '--port <port>': { description: 'The port to start the api on', default: '1236' },
      '--dryRun': { description: 'Show what would be done' },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts ) => {
      console.log ( opts )
      const details = apiKeyDetails ( opts, tc.context.env )
      await startKoa ( 'target/indexer', Number.parseInt ( opts.port.toString () ), opts.debug === true,
        apiKeyHandlers ( tc.context.fetch, details, opts.secret?.toString () ) )
      console.log ( `api key api running on port ${opts.port}` )
    }
  }
}
export function removeApiKeyCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'removeApiKey <email>',
    description: 'remove api keys for the specified email',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-u, --username <username>': { description: 'elastic search username', default: 'Indexer_NPA' },
      '-p, --password <password>': { description: 'Variable name that holds the elastic search password', default: 'ELASTIC_SEARCH_PASSWORD' },
      '--dryRun': { description: 'Show what would be done' },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts, email ) => {
      const details = apiKeyDetails ( opts, tc.context.env )
      console.log ( await invalidateApiKeysForEmail ( tc.context.fetch, details ) ( email ) )
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
      const { file } = opts
      const config = await getConfig ( tc, file.toString () );
      console.log ( JSON.stringify ( config, null, 2 ) )
    }
  }
}

export function indexerCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                  cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig>
) {
  cliTc.addCommands ( tc, [
    addApiKeyApiCommand<Commander, Config, CleanConfig> ( tc ),
    removeApiKeyCommand<Commander, Config, CleanConfig> ( tc ),
    addConfigCommand<Commander, Config, CleanConfig> ( tc ),
    addIndexCommand<Commander, Config, CleanConfig> ( tc ),
    addApiKeyCommand<Commander, Config, CleanConfig> ( tc ),
  ] )
}
