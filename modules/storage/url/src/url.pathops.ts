import { ErrorsAnd } from "@laoban/utils";
import { NameSpaceDetails, OrganisationUrlStoreConfig } from "./url.store.config";

export type UrlStorePathFn = ( org: string, namespace: string ) => ErrorsAnd<string>;
export type UrlStorePathAndDetailsFn = ( org: string, namespace: string ) => ErrorsAnd<PathAndDetails>;
export type PathAndDetails = { path: string, details: NameSpaceDetails }
export const urlStorePathAndDetailsFn = ( config: OrganisationUrlStoreConfig ): UrlStorePathAndDetailsFn =>
  ( org, namespace ) => {
    const nsLookup = config.nameSpaceDetails
    const details = nsLookup[ namespace ];
    if ( !details ) return [ `Don't know how to handle namespace ${namespace}. Legal namespaces are ${Object.keys ( nsLookup )}` ];
    const path = `${config.baseDir}/${org}/${details.pathInGitRepo}`;
    return { path: `${config.baseDir}/${org}/${details.pathInGitRepo}`, details }
  }

export const urlStorePathFn = ( config: OrganisationUrlStoreConfig ): UrlStorePathFn =>
  ( org, namespace ) => {
    const nsLookup = config.nameSpaceDetails
    const details = nsLookup[ namespace ];
    if ( !details ) return [ `Don't know how to handle namespace ${namespace}. Legal namespaces are ${Object.keys ( nsLookup )}` ];
    return `${config.baseDir}/${org}/${details.pathInGitRepo}`
  }

