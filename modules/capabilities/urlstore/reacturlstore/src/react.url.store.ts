import {makeContextFor} from "@itsmworkbench/react_utils";
import {UrlStore} from "@itsmworkbench/urlstore";

export const {use: useUrlStore, Provider: UrlStoreProvider} = makeContextFor<UrlStore, 'urlStore'>('urlStore')
