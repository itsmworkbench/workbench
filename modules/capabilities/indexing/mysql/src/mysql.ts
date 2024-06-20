import { ExecuteIndexOptions, Indexer, IndexingContext } from "@itsmworkbench/indexing";
import { NameAnd } from "@laoban/utils";
import { calculateSinceDate, simpleTemplate } from "@itsmworkbench/utils";
import { formatDate } from "@itsmworkbench/utils/src/date";
import * as mysql from 'mysql2/promise';

export type MysqlConnection = {
  host: string
  port?: number
  user: string
  password: string
  database: string
}
export type MysqlDetails = {
  file: string
  index: string
  connection: MysqlConnection
  sql: string
  id: string
}

export function validateConnectionLoadPassword ( prefix: string, env: NameAnd<string>, connection: MysqlConnection ): MysqlConnection {
  const { host, user, password: passwordEnv, database, port } = connection
  if ( !host ) throw new Error ( `${prefix} host is required` );
  if ( typeof host !== 'string' ) throw new Error ( `${prefix} host must be a string` );
  if ( !user ) throw new Error ( `${prefix} user is required` );
  if ( typeof user !== 'string' ) throw new Error ( `${prefix} user must be a string` );
  if ( !passwordEnv ) throw new Error ( `${prefix} password is required` );
  if ( typeof passwordEnv !== 'string' ) throw new Error ( `${prefix} password must be a string` );
  if ( !database ) throw new Error ( `${prefix} database is required` );
  if ( typeof database !== 'string' ) throw new Error ( `${prefix} database must be a string` );
  const password = env[ passwordEnv ];
  if ( !password ) throw new Error ( `${prefix} password ${passwordEnv} is not an environment variable` );
  return { host, user, password, database, port }
}
const formatMysqlDate = formatDate ( 'YYYY-MM-DD HH:mm:ss' );
export const indexMysql = ( ic: IndexingContext, indexerFn: ( fileTemplate: string, indexId: string ) => Indexer<any>, executeOptions: ExecuteIndexOptions ) =>
  async ( details: MysqlDetails ) => {
    const indexer: Indexer<any> = indexerFn ( details.file, details.index )
    await indexer.start ( details.index )
    try {
      const connectionDetails = validateConnectionLoadPassword ( details.index, ic.env, details.connection )
      const connection = await mysql.createConnection ( connectionDetails )
      const sql = simpleTemplate ( details.sql, { since: formatMysqlDate ( calculateSinceDate ( ic.timeService ) ( executeOptions.since ) ) } )
      console.log ( JSON.stringify ( { connection: details.connection, sql }, null, 2 ) )
      const [ rows ] = (await connection.execute ( sql )) as any[]
      for ( const row of rows )
        await indexer.processLeaf ( details.index, details.id ) ( row )
      console.log ( rows );
      await indexer.finished ( details.index )
    } catch ( e ) {
      console.error ( e )
      await indexer.failed ( details.index, e )
    }
  };