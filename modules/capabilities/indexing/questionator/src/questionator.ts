import { Indexer } from "@itsmworkbench/indexing";
import { promises as fs } from "fs";
import path from "path";

export interface QuestionatorDetails {
  file: string
  index: string
  jsonDirectory: string
  questionDirectory: string
}
type QandA = {
  question: string
  answer: string
}
export const indexQuestionator = ( indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any> ) => async ( details: QuestionatorDetails ) => {
  const indexer: Indexer<any> = indexerFn ( details.file, details.index )
  await indexer.start ( details.index )
  try {
    const jsonDirectory = details.jsonDirectory
    const questionDirectory = details.questionDirectory
    await indexer.finished ( details.index )
    const jsonFiles: string[] = await fs.readdir ( jsonDirectory )
    for ( const jsonFile of jsonFiles ) {
      const jsonAsText = (await fs.readFile ( path.join ( jsonDirectory, jsonFile ) )).toString ( 'utf8' )
      const json = JSON.parse ( jsonAsText )[ 0 ]
      const line1 = { "index": { "_index": details.index, "_id": jsonFile } }
      const line2 = { question: json[ 'X-TIKA:content' ], ...json }
      await indexer.processLeaf ( details.index, jsonFile ) ( line2 )

      const questionFile = path.join ( questionDirectory, jsonFile.replace ( '.json', '_questions.json' ) )
      console.log ( jsonFile, questionFile )
      const questionText = (await fs.readFile ( questionFile )).toString ( 'utf8' )
      const questions: QandA[] = JSON.parse ( questionText ).q_and_a
      console.log ( questions )
      questions.forEach ( async ( { question, answer }, i ) =>
        await indexer.processLeaf ( details.index, jsonFile + '_' + i ) ( { question, answer, ...json } )
      )
    }
  } catch ( e ) {
    await indexer.failed ( details.index, e )
  }
};