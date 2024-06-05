import { promises as fs } from 'fs';
import path from "node:path";
import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { getElasticSearchAuthHeaderWithApiToken } from "./apikey.for.dls";
import { defaultVectorisationModel, loadAndValidatePipelines, pipelineBody, usePipelineBody } from "./pipelines";
import { stopThrottling, withThrottle } from "@itsmworkbench/kleislis";
import { callElasticSearch } from "./callElasticSearch";
import { loadAndValidateIndexMappings } from "./index.mappings";
import { deepCombineTwoObjects, NameAnd } from "@laoban/utils";

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
            console.log ( JSON.stringify ( result ) )
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
      '-f, --field <field>': { description: 'The mapping field to add', default: 'full_text_embeddings' },
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
      let throttle = {
        max: 10,
        current: 0,
        tokensPer100ms: 0.1 //1 post every  second max
      };
      const fetch = withThrottle ( throttle, tc.context.fetch )
      try {
        await processFilesRecursively ( directory.toString (), async f => {
            if ( dryRun )
              console.log ( f );
            else {
              const fileContents = await fs.readFile ( f )
              let body = fileContents.toString ( 'utf8' );
              if ( body.length > 0 ) {
                const response = await fetch ( `${elasticSearch}_bulk`, {
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
      } finally {
        stopThrottling ( throttle )
      }
      console.log ( JSON.stringify ( results, null, 2 ) )
    }
  }
}
//
export function addMakePipelinesCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'pipeline',
    description: 'makes the pipelines',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '-f, --file <file>': { description: 'The pipeline file', default: 'pipelines.yaml' },
      '-m, --model <model>': { description: 'The default vectorisation model', default: defaultVectorisationModel },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually making the pipelines` }
    },
    action: async ( _, opts ) => {
      if ( opts.debug ) console.log ( `Pipeline `, opts )
      const pipelines = await loadAndValidatePipelines ( opts.file.toString (), tc.context.yaml, opts.model.toString () )
      const headers = getElasticSearchAuthHeaderWithApiToken ( tc.context.env, opts.token.toString () )
      const call = callElasticSearch ( tc.context.fetch, headers, 'Put', opts.debug === true );
      for ( const [ name, pipeline ] of Object.entries ( pipelines ) ) {
        const createIndexBody = {
          mappings: {
            properties: {
              [ pipeline.fullText ]: {
                type: 'text'
              },
              [ pipeline.vectorField ]: {
                type: 'sparse_vector',
              }
            }
          }
        }
        const createIndexUrl = `${opts.elasticSearch}${pipeline.index}`
        const createPipelineBody = pipelineBody ( name, pipeline );
        const createPipelineUrl = `${opts.elasticSearch}_ingest/pipeline/${name}`;
        const useUrl = `${opts.elasticSearch}${pipeline.index}/_settings`;
        const useBody = usePipelineBody ( name )
        if ( opts.dryRun === true || opts.debug ) {
          console.log ( 'Making pipeline', name )
          console.log ( createIndexUrl, JSON.stringify ( createIndexBody, null, 2 ) )
          console.log ( createPipelineUrl, JSON.stringify ( createPipelineBody, null, 2 ) )
          console.log ( useUrl, JSON.stringify ( useBody, null, 2 ) )
        }
        if ( opts.dryRun ) return
        await call ( createIndexUrl, createIndexBody );
        await call ( createPipelineUrl, createPipelineBody );
        await call ( useUrl, useBody );
      }
    }
  }
}
export function addRemovePipelinesCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'pipeline-remove',
    description: 'stops the pipeline being used as the default pipeline',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '-f, --file <file>': { description: 'The pipeline file', default: 'pipelines.yaml' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually making the pipelines` }
    },
    action: async ( _, opts ) => {
      if ( opts.debug ) console.log ( `Pipeline `, opts )
      const pipelines = await loadAndValidatePipelines ( opts.file.toString (), tc.context.yaml, 'unused' )
      const headers = getElasticSearchAuthHeaderWithApiToken ( tc.context.env, opts.token.toString () )
      for ( const [ name, pipeline ] of Object.entries ( pipelines ) ) {
        const useUrl = `${opts.elasticSearch}${pipeline.index}/_settings`;
        const useBody = usePipelineBody ( null )
        if ( opts.dryRun === true || opts.debug ) {
          console.log ( 'Making pipeline', name )
          console.log ( useUrl, JSON.stringify ( useBody, null, 2 ) )
        }
        if ( opts.dryRun ) return
        await callElasticSearch ( tc.context.fetch, headers, 'Put', opts.debug === true ) ( useUrl, useBody );
      }
    }
  }
}

//
export function addMakeMappingsCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'mappings',
    description: 'makes the mappings',
    options: {
      '-e, --elastic-search <elastic-search-url>': { description: 'the url of elastic search', default: 'https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/' },
      '-t, --token <token>': { description: 'Variable name that holds the elastic search token', default: 'ELASTIC_TOKEN' },
      '-f, --file <file>': { description: 'The pipeline file', default: 'mappings.yaml' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually making the pipelines` }
    },
    action: async ( _, opts ) => {
      if ( opts.debug ) console.log ( `Mappings `, opts )
      const mappingsFileContents = await loadAndValidateIndexMappings ( opts.file.toString (), tc.context.yaml )
      let headers: NameAnd<string> = getElasticSearchAuthHeaderWithApiToken ( tc.context.env, opts.token.toString () );
      const indicies = Object.keys ( mappingsFileContents )
      for ( const index of indicies ) {
        const url = `${opts.elasticSearch}${index}`
        if ( opts.debug ) console.log ( `Checking index ${index} with ${url}` )
        const existingMappings = await callElasticSearch ( tc.context.fetch, headers, 'Get', opts.debug === true ) ( url )
        if ( opts.debug ) console.log ( JSON.stringify ( existingMappings, null, 2 ) )
        const indexData = existingMappings[ index ]?.mappings?.properties
        console.log ( JSON.stringify ( indexData, null, 2 ) )
        deepCombineTwoObjects ( indexData, mappingsFileContents[ index ] )
      }
    }
  }
}
export function elasticSearchCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                        cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    addPushCommand<Commander, Config, CleanConfig> ( tc ),
    addAddMappingCommand<Commander, Config, CleanConfig> ( tc ),
    addDeleteIndexCommand<Commander, Config, CleanConfig> ( tc ),
    addMakePipelinesCommand<Commander, Config, CleanConfig> ( tc ),
    addRemovePipelinesCommand<Commander, Config, CleanConfig> ( tc ),
    addMakeMappingsCommand<Commander, Config, CleanConfig> ( tc )
  ] )
}

