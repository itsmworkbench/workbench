import { promises as fs } from 'fs';
import path from "node:path";
import { CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";

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

export function addPushCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'push',
    description: 'pushes the files in directory and below to elastic search',
    options: {
      '-d, --directory <directory>': { description: 'The config file', default: 'target' },
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the data` }
    },
    action: async ( _, opts ) => {
      console.log ( `Pushing `, opts )
      const { directory, elasticSearch, dryRun, token } = opts
      const tokenValue = tc.context.env[ token.toString () ]
      if ( tokenValue === undefined ) {
        console.log ( 'Environment variable [' + token + '] not defined' )
        process.exit ( 2 )
      }
      processFilesRecursively ( directory.toString (), async f => {
        if ( dryRun )
          console.log ( f );
        else {
          const fileContents = await fs.readFile ( f )
          let body = fileContents.toString ( 'utf8' );
          if ( body.length > 0 ) {
            const response = await tc.context.fetch ( `${elasticSearch}_bulk`, {
              method: 'Post',
              headers: { 'Content-Type': 'application/x-ndjson', 'Authorization': `ApiKey ${tokenValue}` },
              body: body
            } );
            console.log ( 'file: ', f, response.status, response.statusText, await response.text () )
          } else console.log ( 'file: ', f, 'empty' )
        }
      } )
    }
  }
}