import { mariadbAdapter } from "./MariaDb";
import {IDataAccess} from "@itsmworkbench/shared/IDataAccess";
import {postgresAdapter} from "./PostgresDb";

export function createDb(dbType: string, dbPassword: string): IDataAccess {
    switch (dbType) {
        case "postgres":
            return postgresAdapter(dbPassword);
        case "mariadb":
            return mariadbAdapter(dbPassword);
        default:
            throw new Error(`Unsupported dbType: ${dbType}`);
    }
}