export type SqlSelect = { query: string };
export type SqlUpdate = { query: string };

export type SqlResult = { type: "select"; rows: any[] };
export type SqlUpdateResult = { type: "update"; affectedRows: number };
export type QueryResponse = SqlResult | SqlUpdateResult;

export interface IDataAccess {
    select(query: SqlSelect, dbType?: string, dbPassword?: string): Promise<QueryResponse>;
    update(query: SqlUpdate, dbType?: string, dbPassword?: string): Promise<QueryResponse>;
    testConnection(dbType?: string, dbPassword?: string): Promise<string>;
}
