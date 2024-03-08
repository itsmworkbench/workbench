import { ErrorsAnd, mapErrors, NameAnd } from "@laoban/utils";
import { isNamedUrl, NamedOrIdentityUrl, NamedUrl } from "./identity.and.name.url";
import { PathAndDetails, urlStorePathAndDetailsFn } from "./url.pathops";


export type UrlStoreParser = ( id: string, s: string ) => any
export type UrlStoreWriter = ( content: any ) => ErrorsAnd<string>
export interface NameSpaceDetails {
  mimeType: string
  parser: UrlStoreParser
  writer: UrlStoreWriter
  encoding: BufferEncoding
}
export interface NameSpaceDetailsForGit extends NameSpaceDetails {
  pathInGitRepo: string
  extension: string
}
export function nameSpaceDetails ( name: string, partial: Partial<NameSpaceDetails> & Required<Pick<NameSpaceDetails, 'writer' | 'parser'>> ): NameSpaceDetails {
  return {
    mimeType: partial.mimeType || 'text/yaml',
    parser: partial.parser,
    writer: partial.writer,
    encoding: partial.encoding || 'utf8'
  }
}
export function nameSpaceDetailsForGit ( name: string, partial: Partial<NameSpaceDetailsForGit> & Required<Pick<NameSpaceDetailsForGit, 'parser' | 'writer'>> ): NameSpaceDetailsForGit {
  return {
    ...nameSpaceDetails ( name, partial ),
    pathInGitRepo: partial.pathInGitRepo || name,
    extension: partial.extension || 'yaml',
  }
}


export type OrganisationUrlStoreConfigForGit = {
  baseDir: string
  nameSpaceDetails: NameAnd<NameSpaceDetailsForGit>
}


export function repoFrom ( config: OrganisationUrlStoreConfigForGit, url: NamedOrIdentityUrl ): string {
  return config.baseDir + '/' + url.organisation;
}
export function urlToDetails<A extends NameSpaceDetails> ( nsToDetails: NameAnd<A>, url: NamedOrIdentityUrl ): ErrorsAnd<A> {
  const details = nsToDetails[ url.namespace ];
  if ( !details ) return [ `Don't know how to handle namespace ${url.namespace}. Legal namespaces are ${Object.keys ( nsToDetails )}` ];
  return details
}
export const namedUrlToPathAndDetails = ( config: OrganisationUrlStoreConfigForGit ) => {
  const pathFn = urlStorePathAndDetailsFn ( config )
  return ( named: NamedUrl ): ErrorsAnd<PathAndDetails> => {
    if ( !isNamedUrl ( named ) ) return [ `${JSON.stringify ( named )} is not a NamedUrl` ]
    return mapErrors ( pathFn ( named.organisation, named.namespace ),
      ( { path, details } ) =>
        ({ path: `${path}/${named.name}.${details.extension}`, details }) )
  }
}
