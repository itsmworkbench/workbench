import {KnowledgeArticle} from "./knowledgeArticle";
import {ErrorsAnd, hasErrors, mapK} from "@laoban/utils";
import {NamedLoadResult, NamedUrl, UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {ErrorsOr} from "@itsmworkbench/errors";

export type KADetails = {
    name: string
    id?: string
    descriptionOrError: string
    ka?: KnowledgeArticle
}

export function makeKaDetails(name: string, details: ErrorsAnd<NamedLoadResult<KnowledgeArticle>>): KADetails {
    if (hasErrors(details)) return {name, descriptionOrError: details.join('\n')}
    return {name, descriptionOrError: details.result.description, ka: details.result, id: details.id}
}

export type KaDetailsProps = {
    urlStore: UrlStore
    org: string
    system: string
}

export async function findKaDetails({urlStore, org, system}: KaDetailsProps): Promise<ErrorsOr<KADetails[]>> {
    const urlQuery: UrlQuery = {
        org,
        namespace: 'ka',
        path: system,
        pageQuery: {page: 1},
        order: 'name'
    }
    const kaNames = await urlStore.list(urlQuery)
    if (hasErrors(kaNames)) return {errors: kaNames}
    const names = kaNames.names

    const kas = await mapK(names,
        async name => {
            const url: NamedUrl = {scheme: 'itsm', name: `${system}/${name}`, namespace: 'ka', organisation: org};
            const loaded = await urlStore.loadNamed<KnowledgeArticle>(url)
            return makeKaDetails(name, loaded);
        })
    return {value: kas}
}