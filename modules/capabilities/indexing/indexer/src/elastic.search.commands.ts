import { promises as fs } from 'fs';
import path from "node:path";
import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { getElasticSearchAuthHeaderWithApiToken } from "./apikey.for.dls";
import { addApiKeyApiCommand, addApiKeyCommand, addConfigCommand, addIndexCommand, removeApiKeyCommand } from "./indexer.commands";

async function processFilesRecursively ( rootDir: string, processFile: ( filePath: string ) => Promise<void> ) {
  async function processDirectory ( directory: string ) {
    const entries = await fs.readdir ( directory, { withFileTypes: true } );

    for ( const entry of entries ) {
      const fullPath = path.join ( directory, entry.name );
      if ( entry.isDirectory () ) {
        await processDirectory ( fullPath );
      } else if ( entry.isFile () ) {
        await processFile ( fullPath );
      }
    }
  }

  await processDirectory ( rootDir );
}

type PushResult = {
  successful: number
  calls: number
  non200: number
  non200Details: string[]
}

export function addDeleteIndexCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'deleteIndex',
    description: 'deletes an index from elastic search',
    options: {
      '-i, --index <index...>': { description: 'The indexes to delete', default: [] },
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually deleting the index` }
    },
    action: async ( _, opts ) => {
      console.log ( `Opts`, opts )
      const { elasticSearch, dryRun, token } = opts
      for ( const index of opts.index as string[] ) {
        const url = `${elasticSearch}${index}`;
        if ( dryRun === true ) {
          console.log ( url )
        } else {
          const response = await tc.context.fetch ( url, {
            method: 'Delete',
            headers: { ...getElasticSearchAuthHeaderWithApiToken ( tc.context.env, token.toString () ) }
          } );
          if ( response.ok ) {
            const result = await response.json ()
            if ( opts.debug ) console.log ( JSON.stringify ( result ) )
          } else {
            console.log ( response.status, response.statusText, await response.text () )
          }
        }
      }
    }
  }

}

export function addAddMappingCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'addMapping',
    description: 'adds a mapping for dense vectors to the index',
    options: {
      '-i, --index <index...>': { description: 'The indexes to add the mapping to', default: [] },
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-f, --field <field>': { description: 'The mapping field to add', default: 'full_text_embedding' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the mapping` }
    },
    action: async ( _, opts ) => {
      console.log ( `Opts`, opts )
      const { elasticSearch, dryRun, token } = opts
      const body = JSON.stringify ( {
        properties: {
          [ opts.field.toString () ]: {
            type: "sparse_vector"
          }
        }
      } );
      for ( const index of opts.index as string[] ) {
        const url = `${elasticSearch}${index}/_mapping`;
        if ( dryRun === true ) {
          console.log ( url, JSON.stringify ( body ) )
        } else {
          const response = await tc.context.fetch ( url, {
            method: 'Post',
            headers: { ...getElasticSearchAuthHeaderWithApiToken ( tc.context.env, token.toString () ), 'Content-Type': 'application/x-ndjson' },
            body: body
          } );
          if ( response.ok ) {
            const result = await response.json ()
            if ( opts.debug ) console.log ( JSON.stringify ( result ) )
          } else {
            console.log ( response.status, response.statusText, await response.text () )
          }
        }
      }
    }
  }
}

export function addPushCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'push',
    description: 'pushes the files in directory and below to elastic search',
    options: {
      '-d, --directory <directory>': { description: 'The config file', default: 'target' },
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the data` }
    },
    action: async ( _, opts ) => {
      console.log ( `Pushing `, opts )
      const { directory, elasticSearch, dryRun, token } = opts
      // const tokenValue = getElasticSearchToken ( tc.context.env, token );

      const results: PushResult = { successful: 0, non200: 0, non200Details: [], calls: 0 }
      await processFilesRecursively ( directory.toString (), async f => {
          if ( dryRun )
            console.log ( f );
          else {
            const fileContents = await fs.readFile ( f )
            let body = fileContents.toString ( 'utf8' );
            if ( body.length > 0 ) {
              const response = await tc.context.fetch ( `${elasticSearch}_bulk`, {
                method: 'Post',
                headers: { ...getElasticSearchAuthHeaderWithApiToken ( tc.context.env, token.toString () ), 'Content-Type': 'application/x-ndjson' },
                body: body
              } );
              results.calls++
              if ( response.ok ) {
                const result = await response.json ()
                if ( opts.debug ) console.log ( f, JSON.stringify ( result ) )
                results.successful += 1
              } else {
                results.non200++
                let text = await response.text ();
                results.non200Details.push ( `${f} ${response.status} ${response.statusText} ${text}` )
                console.log ( 'file: ', f, response.status, response.statusText, text )
              }
            } else console.log ( 'file: ', f, 'empty' )
          }
        }
      )
      console.log ( JSON.stringify ( results, null, 2 ) )
    }
  }
}

//
// export function addMakePipelinesCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
//   return {
//     cmd: 'pipeline',
//     description: 'makes the pipelines',
//     options: {
//       '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
//       '-u, --username <username>': { description: 'elastic search username', default: 'Indexer_NPA' },
//       '-p, --password <password>': { description: 'Variable name that holds the elastic search password', default: 'ELASTIC_SEARCH_PASSWORD' },
//       '-i, --index <index...>': { description: 'The indexes to make the pipeline for', default: [ 'jira-prod' ] },
//       '-f, --file <file>': { description: 'The config file', default: 'indexer.yaml' },
//       '-t, --template <template>': { description: 'The template file', default: 'injest.pipeline.template.json' },
//     },
//     action: async ( _, opts ) => {
//       console.log ( `Pipeline `, opts )
//       const { file, debug, dryrun, template } = opts
//       if ( typeof template === 'boolean' ) throw new Error ( 'template should be a string' )
//
//       const keyDetails = apiKeyDetails ( opts, tc.context.env )
//       const templateStats = await fs.promises.stat ( template )
//       if ( !templateStats.isFile () ) throw new Error ( `Template file ${template} is not a file` )
//       const templateString = await fs.promises.readFile ( template, 'utf8' )
//       for (const i of opts.index || [])
//     }
//   }
// }


export function elasticSearchCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                  cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig>
) {
  cliTc.addCommands ( tc, [
    addPushCommand<Commander, Config, CleanConfig> ( tc ),
    addAddMappingCommand<Commander, Config, CleanConfig> ( tc ),
    addDeleteIndexCommand<Commander, Config, CleanConfig> ( tc ),
  ] )
}
