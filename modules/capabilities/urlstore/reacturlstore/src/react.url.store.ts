import {makeContextFor} from "@itsmworkbench/react_utils";
import {NamedLoadResult, NamedUrl, UrlQuery, UrlStore} from "@itsmworkbench/urlstore";
import {ErrorsAnd, hasErrors, mapK} from "@laoban/utils";
import {KnowledgeArticle} from "@itsmworkbench/knowledgearticle";
import {ErrorsOr} from "@itsmworkbench/errors";

export const {use: useUrlStore, Provider: UrlStoreProvider} = makeContextFor<UrlStore, 'urlStore'>('urlStore')
