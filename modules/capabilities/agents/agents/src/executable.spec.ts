// Utility function to check if the result has errors
import { ErrorsAnd } from "@laoban/utils";
import { addLogToExecutable, Executable, execute, executeAgentNeedDefined } from "./executable";

const hasErrors = <T> ( result: ErrorsAnd<T> ): result is string[] => Array.isArray ( result );

describe ( 'Executable Functions', () => {
  const mockContext = {};
  const mockQuery = 'input';
  const mockResult = 'input-processed';

  let executable: Executable<typeof mockContext, string, string>;

  beforeEach ( () => {
    executable = {
      name: 'TestExecutable',
      description: 'An executable for testing',
      validate: async ( c, q ) => (q === 'invalid-input' ? [ 'input error' ] : []),
      validateResult: async ( c, q, r ) => (r === 'invalid-result' ? [ 'result error' ] : []),
      fn: async ( c, q ) => (q === 'input' ? `input-processed` : undefined),
    };
  } );

  describe ( 'execute', () => {
    it ( 'should return the result when there are no validation errors', async () => {
      const result = await execute ( executable, mockContext, mockQuery );
      expect ( result ).toBe ( mockResult );
    } );

    it ( 'should return input validation errors', async () => {
      const inputErrors = [ 'input error' ];
      const result = await execute ( executable, mockContext, 'invalid-input' );
      expect ( result ).toEqual ( inputErrors );
    } );

    it ( 'should return result validation errors', async () => {
      const resultWithError = 'invalid-result';
      executable.fn = async ( c, q ) => resultWithError;
      const result = await execute ( executable, mockContext, mockQuery );
      expect ( result ).toEqual ( [ 'result error' ] );
    } );
  } );

  describe ( 'executeAgentNeedDefined', () => {
    it ( 'should return the result when there are no validation errors', async () => {
      const result = await executeAgentNeedDefined ( 'Execution failed', executable, mockContext, mockQuery );
      expect ( result ).toBe ( mockResult );
    } );

    it ( 'should throw an error when result is undefined', async () => {
      executable.fn = async ( c, q ) => undefined;
      await expect ( executeAgentNeedDefined ( 'Execution failed', executable, mockContext, mockQuery ) ).rejects.toThrow ( 'Execution failed' );
    } );
  } );
  describe ( 'addLogToExecutable', () => {
    it ( 'should log the context, query, and result when there are no validation errors', async () => {
      const remembered: string[] = [];
      const log = ( c: typeof mockContext, q: string, r: string ) => {
        remembered.push ( `Context: ${JSON.stringify ( c )}, Query: ${q}, Result: ${r}` );
      };
      const loggedExecutable = addLogToExecutable ( executable, log );
      const result = await execute ( loggedExecutable, mockContext, mockQuery );
      expect ( result ).toBe ( mockResult );
      expect ( remembered ).toEqual ( [ `Context: {}, Query: input, Result: input-processed` ] );
    } );

    it ( 'should not log if there are input validation errors', async () => {
      const remembered: string[] = [];
      const log = ( c: typeof mockContext, q: string, r: string ) => {
        remembered.push ( `Context: ${JSON.stringify ( c )}, Query: ${q}, Result: ${r}` );
      };
      const loggedExecutable = addLogToExecutable ( executable, log );
      const result = await execute ( loggedExecutable, mockContext, 'invalid-input' );
      expect ( result ).toEqual ( [ 'input error' ] );
      expect ( remembered ).toEqual ( [] );
    } );

    it ( 'should  log if there are result validation errors', async () => {
      const remembered: string[] = [];
      const log = ( c: typeof mockContext, q: string, r: string ) => {
        remembered.push ( `Context: ${JSON.stringify ( c )}, Query: ${q}, Result: ${r}` );
      };
      executable.fn = async ( c, q ) => 'invalid-result';
      const loggedExecutable = addLogToExecutable ( executable, log );
      const result = await execute ( loggedExecutable, mockContext, mockQuery );
      expect ( result ).toEqual ( [ 'result error' ] );
      expect ( remembered ).toEqual ( [ "Context: {}, Query: input, Result: invalid-result" ] );
    } );
  } );
} );
