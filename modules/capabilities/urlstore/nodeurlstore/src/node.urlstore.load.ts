import { ErrorsAnd, mapErrorsK } from "@laoban/utils";
import { IdentityUrl, IdentityUrlLoadResult, isIdentityUrl, NamedLoadResult, NamedUrl, namedUrlToPathAndDetails, OrganisationUrlStoreConfigForGit, repoFrom, UrlLoadIdentityFn, UrlLoadNamedFn, urlToDetails, writeUrl } from "@itsmworkbench/urlstore";
import { GitOps } from "@itsmworkbench/git";
import path from "path";
import { fileLoading, loadStringIncrementally } from "@itsmworkbench/fileloading";
import { ResultAndNewStart } from "@itsmworkbench/eventstore";


export const loadFromNamedUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlLoadNamedFn => <T> ( named: NamedUrl, offset?: number ): Promise<ErrorsAnd<NamedLoadResult<T>>> => {
  return mapErrorsK ( namedUrlToPathAndDetails ( config ) ( named ), async ( { path: p, details } ) => {
    try {
      const fl = fileLoading ( p )
      const { result: raw, newStart: fileSize }: ResultAndNewStart = await loadStringIncrementally ( fl ) ( offset, details.encoding )
      const namedUrl = writeUrl(named)
      const result = await details.parser (namedUrl, raw )
      const repo = repoFrom ( config, named )
      const hash = await gitOps.hashFor ( repo, path.relative ( repo, p ) )
      const id = `itsmid/${named.organisation}/${named.namespace}/${hash}`
      return { url: namedUrl, mimeType: details.mimeType, result, id, fileSize }
    } catch ( e :any) {
      return [ `Loading ${JSON.stringify ( named )} - ${e.toString ()}` ]
    }
  } )

}

export const loadFromIdentityUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlLoadIdentityFn => async <T> ( identity: IdentityUrl ): Promise<ErrorsAnd<IdentityUrlLoadResult<T>>> => {
  if ( !isIdentityUrl ( identity ) ) return [ `${JSON.stringify ( identity )} is not a IdentityUrl` ]
  return mapErrorsK ( urlToDetails ( config.nameSpaceDetails, identity ), async ( details ) => {
    try {
      const repo = repoFrom ( config, identity )
      const string = await gitOps.fileFor ( repo, identity.id, details.encoding )
      const identityUrl = writeUrl ( identity )
      const result = await details.parser ( identityUrl, string )
      return { url: identityUrl, mimeType: details.mimeType, result, id: identityUrl }
    } catch ( e : any) {
      return [ e.toString () ]
    }
  } )
}

