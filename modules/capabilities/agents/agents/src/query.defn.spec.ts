// Helper method to create appender executables
import { Executable } from "./executable";
import { executeQuery, QueryDefn, QueryListener, Who } from "./query.defn";

const createAppenderExecutable = ( name: string, description: string, suffix: string ): Executable<{}, string, string> => ({
  name,
  description,
  validate: async ( c, q ) => [],
  validateResult: async ( c, q, r ) => [],
  fn: async ( c, q ) => `${q}${suffix}`
});

// Simple executables for testing
const intentExecutable: Executable<{}, string, string> = {
  name: 'intent',
  description: 'Determines intent and appends _I',
  validate: async ( c, q ) => [],
  validateResult: async ( c, q, r ) => [],
  fn: async ( c, q ) => `${q}_I`
};

const whoExecutable = ( who: string[] ): Executable<{}, { query: string, result: string }, Who> => ({
  name: 'who',
  description: 'Determines who should work',
  validate: async ( c, q ) => [],
  validateResult: async ( c, q, r ) => [],
  fn: async ( c, q ) => ({ who })
})

const jiraExecutable = createAppenderExecutable ( 'jira', 'Appends _J', '_J' );
const confluenceExecutable = createAppenderExecutable ( 'confluence', 'Appends _C', '_C' );
const gitlabExecutable = createAppenderExecutable ( 'gitlab', 'Appends _G', '_G' );

const composeExecutable: Executable<{}, { query: string, result: string[] }, string> = {
  name: 'composeResult',
  description: 'Composes the final result',
  validate: async ( c, q ) => [],
  validateResult: async ( c, q, r ) => [],
  fn: async ( c, q ) => q.result.join ( ',' )
};

// Query Definition
const queryDefn = ( who: string[] ): QueryDefn<{}, string, string, string, string> => ({
  intent: intentExecutable,
  who: whoExecutable ( who ),
  workers: {
    jira: jiraExecutable,
    confluence: confluenceExecutable,
    gitlab: gitlabExecutable
  },
  composeResult: composeExecutable
})

// Query Listener
const rememberedLogs: string[] = [];
const queryListener: QueryListener<{}, string, string, string, string> = {
  start: ( c, q ) => rememberedLogs.push ( `start: ${q}` ),
  processErrors: ( stage, es ) => rememberedLogs.push ( `processErrors: ${stage}, ${es.join ( ',' )}` ),
  intent: ( c, q, i ) => rememberedLogs.push ( `intent: ${q}, ${i}` ),
  who: ( c, q, w ) => rememberedLogs.push ( `who: ${q.query}, ${q.result}, ${JSON.stringify ( w )}` ),
  workerResult: ( c, q, w ) => rememberedLogs.push ( `workerResult: ${q}, ${w}` ),
  result: ( c, q, r ) => rememberedLogs.push ( `result: ${q.query}, ${q.result.join ( ',' )}, ${r}` )
};

// Test Suite
describe ( 'executeQuery', () => {
  beforeEach ( () => {
    rememberedLogs.length = 0; // Clear the logs before each test
  } );

  it ( 'should execute the query and log the process - 0 workers', async () => {
    const executeQueryFunction = await executeQuery ( queryDefn ( [] ), {}, queryListener );
    const result = await executeQueryFunction ( 'testQuery' );

    expect ( result ).toBe ( '' );
    expect ( rememberedLogs ).toEqual ( [
      "start: testQuery",
      "intent: testQuery, testQuery_I",
      "who: testQuery, testQuery_I, {\"who\":[]}",
      "result: testQuery, , "
    ] );
  } );
  it ( 'should execute the query and log the process - 1 workers', async () => {
    const executeQueryFunction = await executeQuery ( queryDefn ( [ 'jira' ] ), {}, queryListener );
    const result = await executeQueryFunction ( 'testQuery' );

    expect ( result ).toBe ( 'testQuery_J' );
    expect ( rememberedLogs ).toEqual ( [
      "start: testQuery",
      "intent: testQuery, testQuery_I",
      "who: testQuery, testQuery_I, {\"who\":[\"jira\"]}",
      "workerResult: testQuery, testQuery_J",
      "result: testQuery, testQuery_J, testQuery_J"
    ] );
  } );
  it ( 'should execute the query and log the process - 2 workers one with illegal name ', async () => {
    const executeQueryFunction = await executeQuery ( queryDefn ( [ 'jira', 'notin' ] ), {}, queryListener );
    const result = await executeQueryFunction ( 'testQuery' );

    expect ( result ).toBe ( 'testQuery_J' );
    expect ( rememberedLogs ).toEqual ( [
      "start: testQuery",
      "intent: testQuery, testQuery_I",
      "who: testQuery, testQuery_I, {\"who\":[\"jira\",\"notin\"]}",
      "workerResult: testQuery, testQuery_J",
      "result: testQuery, testQuery_J, testQuery_J"
    ] );
    throw 'rewrite: needs to log the wrong ones'
  } );


  it ( 'should handle worker execution and log correctly', async () => {
    const executeQueryFunction = await executeQuery ( queryDefn([ "jira", "confluence", 'gitlab' ]), {}, queryListener );
    const result = await executeQueryFunction ( 'newQuery' );

    expect ( result ).toBe ( 'newQuery_J,newQuery_C,newQuery_G' );
    expect ( rememberedLogs ).toEqual ( [
      "start: newQuery",
      "intent: newQuery, newQuery_I",
      "who: newQuery, newQuery_I, {\"who\":[\"jira\",\"confluence\",\"gitlab\"]}",
      "workerResult: newQuery, newQuery_J",
      "workerResult: newQuery, newQuery_C",
      "workerResult: newQuery, newQuery_G",
      "result: newQuery, newQuery_J,newQuery_C,newQuery_G, newQuery_J,newQuery_C,newQuery_G"
    ] );
  } );
} );
