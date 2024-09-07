import { ErrorsAnd, mapErrorsK } from "@laoban/utils";
import { IdentityUrl, isNamedUrl, NamedOrIdentityUrl, namedUrlToPathAndDetails, OrganisationUrlStoreConfigForGit, repoFrom, UrlSaveFn, UrlSaveOptions, UrlStoreResult, writeUrl } from "@itsmworkbench/urlstore";
import * as fs from "fs";
import { GitOps } from "@itsmworkbench/git";
import path from "path";
import { fileLoading, fileLocking, withFileLock } from "@itsmworkbench/fileloading";


export const saveNamedUrl = ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlSaveFn =>
  async ( namedOrUrl: NamedOrIdentityUrl, content: any, options?: UrlSaveOptions ): Promise<ErrorsAnd<UrlStoreResult>> => {
    if ( !isNamedUrl ( namedOrUrl ) ) return [ `${JSON.stringify ( namedOrUrl )} is not a NamedUrl` ]
    return mapErrorsK ( namedUrlToPathAndDetails ( config ) ( namedOrUrl ), ( { path: thePath, details } ) => {
      return mapErrorsK ( details.writer ( content ), async ( string: string ): Promise<ErrorsAnd<UrlStoreResult>> => {
        try {
          console.log ( 'saveNamedUrl', namedOrUrl, thePath )
          console.log ( '  --append', options )
          console.log ( '  --content', content )
          console.log ( '  --asString', string )
          if ( string === undefined ) return [ `Failed to turn this into string ${JSON.stringify ( namedOrUrl )}\n${content}` ]
          if ( namedOrUrl.url === undefined ) return [ `NamedUrl ${JSON.stringify ( namedOrUrl )} has no url` ]
          await fs.promises.mkdir ( path.dirname ( thePath ), { recursive: true } )
          const repo = repoFrom ( config, namedOrUrl )
          await gitOps.init ( repo ) // creates a new repo if needed including the directory.
          const { id, idAsString } = await withFileLock ( fileLocking ( thePath ), async () => {
            if ( options?.append )
              await fs.promises.appendFile ( thePath, string, { encoding: details.encoding } )
            else
              await fs.promises.writeFile ( thePath, string, { encoding: details.encoding } )
            const hash = await gitOps.hashFor ( repo, path.relative ( repo, thePath ) )
            let id: IdentityUrl = { scheme: 'itsmid', organisation: namedOrUrl.organisation, namespace: namedOrUrl.namespace, id: hash };
            const idAsString = writeUrl ( id )
            if ( options?.commit != false ) await gitOps.commit ( repo, `Saving ${namedOrUrl.name} as ${idAsString}` )
            return { id, idAsString }
          } )
          const fileSize = options?.append ? undefined : await gitOps.sizeForHash ( repo, id.id )
          const result: UrlStoreResult = { url: namedOrUrl.url, fileSize, id: idAsString };
          return result
        } catch ( e: any ) {
          return [ `Failed to save ${JSON.stringify ( namedOrUrl )} Options=${JSON.stringify ( options )}\n${JSON.stringify ( content )}\nError ${JSON.stringify ( e )}` ]
        }
      } )
    } )
  }