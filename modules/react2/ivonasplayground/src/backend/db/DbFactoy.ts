import { mariadbAdapter } from "./MariaDb";
import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";
import {postgresAdapter} from "./PostgresDb";

const dbMap: Record<string, IDataAccess> = {
    postgres: postgresAdapter,
    mariadb: mariadbAdapter,
};

export function createDb(dbType: string): IDataAccess {
    const db = dbMap[dbType];
    if (!db) {
        throw new Error(`Unsupported dbType: ${dbType}`);
    }
    return db;
}
