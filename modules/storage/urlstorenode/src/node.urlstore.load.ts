import { ErrorsAnd, hasErrors, mapErrorsK } from "@laoban/utils";
import { IdentityUrl, isIdentityUrl, isNamedUrl, NamedUrl, namedUrlToPathAndDetails, OrganisationUrlStoreConfigForGit, parseUrl, repoFrom, UrlLoadFn, UrlLoadResult, urlToDetails } from "@itsmworkbench/url";
import { GitOps } from "@itsmworkbench/git";
import path from "path";
import { fileLoading, loadStringIncrementally } from "@itsmworkbench/fileloading";
import { ResultAndNewStart } from "@itsmworkbench/eventstore";


export const loadFromNamedUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ) => <T> ( named: NamedUrl, offset?: number ): Promise<ErrorsAnd<UrlLoadResult<T>>> => {
  return mapErrorsK ( namedUrlToPathAndDetails ( config ) ( named ), async ( { path: p, details } ) => {
    console.log ( 'loadFromNamedUrl path', p )
    const fl = fileLoading ( p )
    const { result: raw, newStart: fileSize }: ResultAndNewStart = await loadStringIncrementally ( fl ) ( offset, details.encoding )
    const result = details.parser ( named.url, raw )
    const repo = repoFrom ( config, named )
    const hash = await gitOps.hashFor ( repo, path.relative ( repo, p ) )
    const id = `itsmid:${named.organisation}:${named.namespace}:${hash}`
    return { url: named.url, mimeType: details.mimeType, result, id, fileSize }
  } )
}

export const loadFromIdentityUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ) => async <T> ( identity: IdentityUrl, offset?: number ): Promise<ErrorsAnd<UrlLoadResult<T>>> => {
  if ( !isIdentityUrl ( identity ) ) return [ `${JSON.stringify ( identity )} is not a IdentityUrl` ]
  return mapErrorsK ( urlToDetails ( config.nameSpaceDetails, identity ), async ( details ) => {
    const repo = repoFrom ( config, identity )
    const path = await gitOps.fileFor ( repo, identity.id )
    // const fileSize = await gitOps.sizeForHash ( repo, identity.id )
    const fl = fileLoading ( path )
    const { result: string, newStart: fileSize }: ResultAndNewStart = await loadStringIncrementally ( fl ) ( offset, details.encoding )
    const result = details.parser ( identity.url, string )
    return { url: identity.url, mimeType: details.mimeType, result, fileSize, id: identity.url }
  } )
}

export const loadFromUrlStore = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlLoadFn => async <T> ( url: string, offset?: number ): Promise<ErrorsAnd<UrlLoadResult<T>>> => {
  const namedOrIdentity = parseUrl ( url )
  if ( hasErrors ( namedOrIdentity ) ) return namedOrIdentity
  if ( isNamedUrl ( namedOrIdentity ) ) return loadFromNamedUrl ( gitOps, config ) ( namedOrIdentity, offset )
  if ( isIdentityUrl ( namedOrIdentity ) ) return loadFromIdentityUrl ( gitOps, config ) ( namedOrIdentity, offset )
  return [ `${url} is not a valid url` ]
}