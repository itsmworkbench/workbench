import { execute, ExecuteInShellFn } from "@itsmworkbench/shell";
import { Sqler, SqlQueryResult, SqlUpdateFn } from "@itsmworkbench/sql";
import { ErrorsAnd, mapErrors, NameAnd } from "@laoban/utils";
import { parseColumnsToJSON } from "@itsmworkbench/utils";

export function makeSqlerForDbPathShell ( executeFn: ExecuteInShellFn, cwd: string, debug?: boolean ): Sqler {
  let query = async ( sql, env ): Promise<ErrorsAnd<SqlQueryResult>> => {
    const cmd = `dbpath sql --env ${env} --json "${sql.join ( ' ' )}"`;
    if ( debug ) console.log ( 'query - cmd:', cmd )
    return mapErrors ( await execute ( executeFn, cwd, cmd, 'utf8', debug ), ( res ) => {
      console.log ( 'res:', res )
      const rows: NameAnd<string>[] = JSON.parse ( res );
      const cols: string[] = rows.length === 0 ? [] : Object.keys ( rows[ 0 ] ).sort ();
      const result: SqlQueryResult = { cols, rows };
      if ( debug ) console.log ( 'query - result:', JSON.stringify ( result, null, 2 ) )
      return result;
    } )
  };
  let update: SqlUpdateFn = async ( sql, env ): Promise<ErrorsAnd<string>> => {
    const cmd = `dbpath sql --update --env ${env} --json "${sql.join ( ' ' )}"`;
    if ( debug ) console.log ( 'query - cmd:', cmd )
    return mapErrors ( await execute ( executeFn, cwd, cmd, 'utf8', debug ), ( res ) => {
      if (debug) console.log ( 'res:', res )
      return res;
    } )
  };
  let listEnvs = async (): Promise<ErrorsAnd<NameAnd<NameAnd<string>>>> => {
    const cmd = 'dbpath admin envs';
    if ( debug ) console.log ( 'listEnvs - cmd:', cmd )
    return mapErrors ( await execute ( executeFn, cwd, cmd, 'utf8', debug ), ( res ) => {
      console.log ( 'res:', res )
      const envs: NameAnd<string>[] = parseColumnsToJSON ( res, 1 );
      console.log ( 'envs:', envs )
      const result: NameAnd<NameAnd<string>> = {}
      for ( const env of envs ) {
        result[ env.Environment ] = env
      }
      console.log ( 'result:', result )
      return result
    } )
  };
  return {
    query,
    update,
    test: async (): Promise<ErrorsAnd<string>> => execute ( executeFn, cwd, 'dbpath admin status', 'utf8', debug ),
    listEnvs
  }
}