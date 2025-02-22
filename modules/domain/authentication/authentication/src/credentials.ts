import {NamedUrl, nameSpaceDetailsForGit, UrlStore, UrlStoreParser} from "@itsmworkbench/urlstore";
import {YamlCapability} from "@itsmworkbench/yaml";
import {Authentication} from "@itsmworkbench/login";
import {ErrorsOr, mapErrorsOr} from "@itsmworkbench/errors";
import {hasErrors} from "@laoban/utils";
import {asAuthentication, AuthenticationPlugin, AuthenticationPlugins} from "./authentication/authentication";


function authenticationParser(yaml: YamlCapability): UrlStoreParser {return async (id, s) => yaml.parser(s);}

export const authenticationNameSpace = 'authentication'

export function authenticationNameSpaceDetails(yaml: YamlCapability) {
    return nameSpaceDetailsForGit(authenticationNameSpace, {
        extension: 'yaml',
        mimeType: 'text/markdown; charset=UTF-8',
        parser: authenticationParser(yaml),
        writer: yaml.writer,
    });
}

export type AuthFnResult<A> = {
    auth: A
    authPlugin: AuthenticationPlugin<A>
}
export type AuthFn = (name: string) => Promise<ErrorsOr<AuthFnResult<any>>>

export function authenticationFromNameSpace(organisation: string, urlStore: UrlStore, authenticationPlugins: AuthenticationPlugins) {
    const cache: Record<string, Promise<ErrorsOr<AuthFnResult<any>>>> = {}
    return async (name: string) => {
        const cached = cache[name]
        if (cached) return cached

        async function load(): Promise<ErrorsOr<AuthFnResult<any>>> {
            try {
                const url: NamedUrl = {scheme: 'itsm', namespace: authenticationNameSpace, name, organisation}
                const res = await urlStore.loadNamed<Authentication>(url)
                if (hasErrors(res)) return {errors: res}
                const auth = res.result
                return mapErrorsOr(asAuthentication(authenticationPlugins, res.result), authPlugin => ({auth, authPlugin}))
            } catch (e) {
                return {errors: [e.message]}
            }
        }

        const result = load();
        cache[name] = Promise.resolve(result)
        return result
    }
}