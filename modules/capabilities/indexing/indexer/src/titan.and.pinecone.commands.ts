import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { PineconeConfig, postToPineconeUsingTitan, TitanConfig } from "@itsmworkbench/indexing_pinecone_and_titan";
import { processFilesRecursively } from "./elastic.search.commands";
import * as fs from "node:fs";
import { hasErrors, mapObjectValues, NameAnd } from "@laoban/utils";


export function addTitanAndPineConeCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'pineconePush',
    description: 'pushes data to titan and pinecone',
    options: {
      '-d, --directory <directory>': { description: 'Where the data is ', default: 'target' },
      '-p, --pinecone <pineconeUrl>': { description: 'the url of pinecone', default: 'https://{index}.svc.pinecone.io/' },
      '-t, --titan <titanUrl>': { description: 'the url of titan', default: 'https://bedrock.us-east-1.amazonaws.com/' },
      '--pipeline <pipeline>': { description: 'the pipeline file to use', default: 'pipelines.yaml' },
      '-m, --model <model>': { description: 'the model to use', default: 'someTitanModelId' },
      '--debug': { description: 'Show debug information' },
      '--dryRun': { description: `Just do a dry run instead of actually pushing the data` }

    },
    action: async ( _, opts ) => {
      console.log ( 'pushing to titan and pinecone', opts )

      const pipelines = tc.context.yaml.parser ( (await fs.promises.readFile ( opts.pipeline.toString () )).toString ( 'utf8' ) )
      if ( hasErrors ( pipelines ) ) throw new Error ( 'Failed to parse pipelines: ' + opts.pipeline + ': ' + pipelines.join ( ', ' ) )
      const fields: NameAnd<string[]> = {}
      for ( const [ name, pipeline ] of Object.entries<any> ( pipelines ) ) {
        if ( !pipeline.fields ) throw new Error ( ` Fields not found in pipeline ${opts.pipeline} for ${name}: ${JSON.stringify ( pipeline )}` )
        if ( !pipeline.index ) throw new Error ( ` Index not found in pipeline ${opts.pipeline} for ${name}: ${JSON.stringify ( pipeline )}` )
        fields[ pipeline.index ] = pipeline.fields
      }
      const pineconeConfig: PineconeConfig = {
        url: opts.pinecone.toString (),
        auth: { still: 'todo' },
        fields,
        dryRun: opts.dryRun === true,
        debug: opts.debug === true
      }
      const titanConfig: TitanConfig = {
        url: opts.titan.toString (),
        auth: { still: 'todo' },
        modelId: opts.model.toString (),
        dryRun: opts.dryRun === true,
        debug: opts.debug === true
      }
      const post = postToPineconeUsingTitan ( titanConfig, pineconeConfig, tc.context.fetch )
      const result = await processFilesRecursively ( opts.directory.toString (), async file => {
        const contents = (await fs.promises.readFile ( file )).toString ( 'utf8' )
        const lines = contents.split ( '\n' ).map ( s => s.trim () ).filter ( l => l.trim ().length > 0 )
        const result = await post ( lines )
        if ( !result ) throw new Error ( 'Failed to post to pinecone for file ' + file )
      } )
    }
  }
}

export function titanAndPineconeCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                           cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    addTitanAndPineConeCommands<Commander, Config, CleanConfig> ( tc ),
  ] )
}

