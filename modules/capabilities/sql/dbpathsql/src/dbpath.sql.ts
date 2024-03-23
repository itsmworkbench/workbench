import { execute, ExecuteInShellFn } from "@itsmworkbench/shell";
import { Sqler, SqlQueryResult } from "@itsmworkbench/sql";
import { ErrorsAnd, mapErrors, NameAnd } from "@laoban/utils";

export function makeSqlerForDbPathShell ( executeFn: ExecuteInShellFn, cwd: string, debug?: boolean ): Sqler {
  return {
    query: async ( sql, env ): Promise<ErrorsAnd<SqlQueryResult>> => {
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
    },
    update: async ( sql, env ): Promise<ErrorsAnd<number>> => [ 'Currently updates are not supported' ],
    test: async (): Promise<ErrorsAnd<string>> => execute ( executeFn, cwd, 'dbpath admin status', 'utf8', debug )
  }
}