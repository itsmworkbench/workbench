import {YamlCapability} from "@itsmworkbench/yaml";
import {nameSpaceDetailsForGit} from "@itsmworkbench/urlstore";
import {camelCaseAndIdYamlParser} from "@itsmworkbench/domain";

export interface DatabaseConnection {
    type: string
    host : string
    port : string
    database: string
    email: string
    schema : string
    username : string
    password: string
    connectionName : string
}

export function databaseNamespaceDetails(yaml: YamlCapability) {
    return nameSpaceDetailsForGit('databaseConnection', {
        parser: async (id, s) => camelCaseAndIdYamlParser(yaml)(id, s),
        writer: yaml.writer,
    });
}