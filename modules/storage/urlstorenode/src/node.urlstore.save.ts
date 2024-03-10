import { ErrorsAnd, mapErrorsK } from "@laoban/utils";
import { isNamedUrl, NamedOrIdentityUrl, namedUrlToPathAndDetails, OrganisationUrlStoreConfigForGit, repoFrom, UrlSaveFn, UrlStoreResult, writeUrl } from "@itsmworkbench/url";
import * as fs from "fs";
import { GitOps } from "@itsmworkbench/git";
import path from "path";


export const saveNamedUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlSaveFn =>
  async ( namedOrUrl: NamedOrIdentityUrl, content: any ): Promise<ErrorsAnd<UrlStoreResult>> => {
    if ( !isNamedUrl ( namedOrUrl ) ) return [ `${JSON.stringify ( namedOrUrl )} is not a NamedUrl` ]
    return mapErrorsK ( namedUrlToPathAndDetails ( config ) ( namedOrUrl ), ( { path: thePath, details } ) => {
      return mapErrorsK ( details.writer ( content ), async string => {
        try {
          console.log ( 'saveNamedUrl', namedOrUrl, thePath )
          console.log ( '  --content', content )
          console.log ( '  --asString', string )
          if ( string === undefined ) return [ `Failed to turn this into string ${JSON.stringify ( namedOrUrl )}\n${content}` ]
          await fs.promises.mkdir ( path.dirname ( thePath ), { recursive: true } )
          await fs.promises.writeFile ( thePath, string, { encoding: details.encoding } )
          const repo = repoFrom ( config, namedOrUrl )
          const hash = await gitOps.hashFor ( repo, path.relative ( repo, thePath ) )
          const id = writeUrl ( { scheme: 'itsmid', organisation: namedOrUrl.organisation, namespace: namedOrUrl.namespace, id: hash } )
          await gitOps.init ( repo ) // creates a new repo if needed including the directory.
          await gitOps.commit ( repo, `Saving ${namedOrUrl.name} as ${id}` )
          const fileSize = await gitOps.sizeForHash ( repo, hash )
          const result: UrlStoreResult = { url: namedOrUrl.url, fileSize, id };
          return result
        } catch ( e ) {
          return [ `Failed to save ${JSON.stringify ( namedOrUrl )}\n${content}`, e ]
        }
      } )
    } )
  }