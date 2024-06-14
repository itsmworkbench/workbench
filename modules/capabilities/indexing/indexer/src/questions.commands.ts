import { CliTc, CommandDetails, ContextConfigAndCommander } from "@itsmworkbench/cli";
import { IndexerContext } from "./context";
import { consoleIndexParentChildLogAndMetrics, fetchArrayWithPaging, FetchArrayWithPagingType, fetchOneItem } from "@itsmworkbench/indexing";
import { ConfluencePagingTC } from "@itsmworkbench/indexing_confluence";
import { defaultRetryPolicy } from "@itsmworkbench/kleislis";
import { JiraIssuePagingTc } from "@itsmworkbench/indexing_jira";
import { NameAnd } from "@laoban/utils";
import { promises as fs } from 'fs';
import path from "path";

type QandA = {
  question: string
  answer: string
}
export function addQuestionCommand<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig> ): CommandDetails<Commander> {
  return {
    cmd: 'questionator',
    description: 'finds the jira users in the project',
    options: {
      '-i, --index <index>': { description: 'the name of the index', default: 'questionator' },
      '-j, --json <json>': { description: 'json directory created by apache tika', default: 'json_directory' },
      '-o, --output <output>': { description: 'output directory', default: 'target/indexer/index/questions/questions.json' },
      '-q, --questions <questions>': { description: 'question directory created by Kamil', default: 'question_directory' },
      '--debug': { description: 'Show debug information' },
    },
    action: async ( _, opts ) => {
      console.log ( `Questionator`, opts )
      const jsonDirectory = opts.json.toString ();
      const questionDirectory = opts.questions.toString ();
      const index = opts.index.toString ();
      const output = opts.output.toString ()
      await fs.mkdir ( path.dirname ( output ), { recursive: true } )
      const jsonFiles: string[] = await fs.readdir ( jsonDirectory )
      for ( const jsonFile of jsonFiles ) {
        const jsonAsText = (await fs.readFile ( path.join ( jsonDirectory, jsonFile ) )).toString ( 'utf8' )
        const json = JSON.parse ( jsonAsText )[ 0 ]
        const line1 = { "index": { "_index": index, "_id": jsonFile } }
        const line2 = { question: json[ 'X-TIKA:content' ], ...json }
        await fs.writeFile ( output, JSON.stringify ( line1 ) + '\n' + JSON.stringify ( line2 ) + '\n', { flag: 'a' } )

        const questionFile = path.join ( questionDirectory, jsonFile.replace ( '.json', '_questions.json' ) )
        console.log ( jsonFile, questionFile )
        const questionText = (await fs.readFile ( questionFile )).toString ( 'utf8' )
        const questions: QandA[] = JSON.parse ( questionText ).q_and_a
        console.log ( questions )
        questions.forEach ( async ( { question, answer }, i ) => {
          const line1 = { "index": { "_index": index, "_id": jsonFile + '_' + i } }
          const line2 = { question, answer, ...json }
          await fs.writeFile ( output, JSON.stringify ( line1 ) + '\n' + JSON.stringify ( line2 ) + '\n', { flag: 'a' } )
        } )
      }
    }
  }
}

export function questionatorCommands<Commander, Config, CleanConfig> ( tc: ContextConfigAndCommander<Commander, IndexerContext, Config, CleanConfig>,
                                                                       cliTc: CliTc<Commander, IndexerContext, Config, CleanConfig> ) {
  cliTc.addCommands ( tc, [
    addQuestionCommand<Commander, Config, CleanConfig> ( tc ),
  ] )
}

