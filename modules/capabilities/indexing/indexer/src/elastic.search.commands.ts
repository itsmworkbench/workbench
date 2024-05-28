import { promises as fs } from 'fs';
import path from "node:path";
import { CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { NameAnd } from "@laoban/utils";
import { getElasticSearchAuthHeaderWithApiToken, getElasticSearchToken } from "./apikey.for.dls";

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
                headers: { ...getElasticSearchAuthHeaderWithApiToken ( tc.context.env, token ), 'Content-Type': 'application/x-ndjson' },
                body: body
              } );
              results.calls++
              if ( response.ok ) {
                const result = await response.json ()
                if ( opts.debug ) console.log ( f, JSON.stringify ( result ) )
                result.successful += 1
              } else {
                results.non200++
                results.non200Details.push ( `${f} ${response.status} ${response.statusText} ${await response.text ()}` )
                console.log ( 'file: ', f, response.status, response.statusText, await response.text () )
              }
            } else console.log ( 'file: ', f, 'empty' )
          }
        }
      )
      console.log ( JSON.stringify ( results, null, 2 ) )
    }
  }
}