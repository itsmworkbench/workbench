//Let's use indexing as an example

//We have a config file that tells us the information about what we want to index
//anactivity to read that file...
//then we have code that parses that file into 'emails', 'teams', 'sap', 'jira' etc
//we want to map reduce that...
//    give each file to a workflow. actually different ones.
//    we then go on hold (for now in memory)
//    we do a foldLeft on the results (legal as this is deterministic)
//        Obviously some logging when they are finished... but we have tools for that like 'debug on'
//    when we have the results we proceed

//these strings are ids in the data lake. We don't want to store much in memory

//insight... every workflow is an activity.
//can we handle that?
//yes just put 'activity outside it... but what do we do about idempotence? We don't really want to 'retry' the whole workflow. Because we trust workflows
//                                     answer helper method that sets up the retry policy for us


import { activity } from "@itsmworkbench/activities";
import { mapK } from "@laoban/utils";
import { nodeActivity, nodeWorkflow } from "@itsmworkbench/nodekleislis";

type IndexingResult = {
  emails: string[]
  teams: string[]
  sap: string[]
  jira: string[]
}

const indexEmail = nodeActivity<number, string[], string> ( { id: 'indexEmail' },
  async ( index: number, ids: string[] ) => {
    const file: string = fileNameForEmail ( index )
    for ( const id of ids ) {
      const emailData = await getEmailData ( id )
      const transformed = await transformEmailData ( emailData )
      appendToFile ( file, transformed )
      return file
    }
  } )

const email = nodeWorkflow ( { id: 'indexemail' },
  async ( config: string ) => {
    const listIdIds = configToEmailIds ( config )
    const idGroups: string[][] = partition ( ids )
    return mapK ( idGroups, ( idGroup, index ) => indexEmail ( engine, index, idGroup ) )

  } );
const teams = nodeWorkflow ( { id: 'indexteams' }, async ( config: string ) => [] );
const sap = nodeWorkflow ( { id: 'indexsap' }, async ( config: string ) => [] );
const jira = nodeWorkflow ( { id: 'indexjira' }, async ( config: string ) => [] );


const indexing = nodeWorkflow ( { id: 'indexing' }, async ( config: string ) => {
  const emailResult = email ( config );
  const teamsResult = teams ( config );
  const sapResult = sap ( config );
  const jiraResult = jira ( config );
  return {
    emails: await emailResult,
    teams: await teamsResult,
    sap: await sapResult,
    jira: await jiraResult
  }
} )

//wow. that's actually quite pretty
//note even without the node backing store... if we just use 'no backing store' we still get the benefits of the retry and throttle


const indexToLocalStorage = nodeWorkflow ( { id: 'indexing' }, async ( config: string ) => {
  //these only push to local storage in this example
  const emailResult = await email.start ( config );
  const teamsResult = await teams.start ( config );
  const sapResult = await sap.start ( config );
  const jiraResult = await jira.start ( config );
  return {
    emails: await emailResult.result,
    teams: await teamsResult.result,
    sap: await sapResult.result,
    jira: await jiraResult.result
  }
} )

const transform = nodeWorkflow ( { id: 'transform' }, async ( config: string ) => {
  let item = config
  while ( true ) {
    item = getNextItemToTransformActivity ( item )
    transformItemAndPutInLocalStorage ( item )
  }
} )

//probably only need one of these...it's pretty fast and it's a reduce
const pushResults = nodeWorkflow ( { id: 'pushResults' }, async ( config: string ) => {
  let item = config
  while ( true ) {
    item = getNextItemToTransformActivity ( item )
  }
} )

const batchIndex = nodeWorkflow ( { id: 'batchIndex' }, async ( config: string ) => {
  const partitionResults = partitionWork ( config )
  const indexToLocal = await indexToLocalStorage.start ( partitionResults );
  const transformResults = await transform.start ( partitionResults );
  const pushResultsResults = await pushResults.start ( partitionResults );


} )