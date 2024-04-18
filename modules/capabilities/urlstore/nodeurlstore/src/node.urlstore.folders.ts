import { promises as fs } from 'fs';
import * as path from 'path';
import { OrganisationUrlStoreConfigForGit, UrlFolder, UrlFolderLoader, urlStorePathFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd, hasErrors } from "@laoban/utils";

export const urlFolders = ( config: OrganisationUrlStoreConfigForGit ): UrlFolderLoader => {
  const orgAndNsToPath = urlStorePathFn ( config )
  async function load ( dirPath: string ) {
    try {
      const entries = await fs.readdir ( dirPath, { withFileTypes: true } );
      const folder: UrlFolder = {
        name: path.basename ( dirPath ),
        children: []
      };

      const errors: string[] = [];
      for ( const entry of entries ) {
        if ( entry.isDirectory () ) {
          const childFolder = await load ( path.join ( dirPath, entry.name ) );
          if ( hasErrors ( childFolder ) ) errors.push ( ...childFolder ); else
            folder.children.push ( childFolder );
        }
      }
      return errors.length > 0 ? errors : folder;
    } catch ( e ) {
      return [ 'urlFolders: ' + dirPath + ": " + e.toString () ];
    }

  }
  return async ( org: string, namespace: string, p?: string ): Promise<ErrorsAnd<UrlFolder>> => {
    const paths = orgAndNsToPath ( org, namespace );
    if ( hasErrors ( paths ) ) return paths
    const dirPath = path.join ( paths, (p ?? '') )
    return load ( dirPath )
  };
}