import {YamlCapability} from "@itsmworkbench/yaml";
import {nameSpaceDetailsForGit, UrlStoreParser} from "@itsmworkbench/urlstore";
import {camelCaseAndIdYamlParser} from "@itsmworkbench/domain";

export interface EmailConnection {
    serviceType: string
    server : string
    port : string
    username : string
    password: string
}

function emailParser(yaml: YamlCapability): UrlStoreParser {
    return async (id, s) => {
        return camelCaseAndIdYamlParser(yaml)(id, s);
    };
}

export function emailNamespaceDetails(yaml: YamlCapability) {
    return nameSpaceDetailsForGit('emailConnection', {
        parser: emailParser(yaml),
        writer: yaml.writer
    });
}