import { promises as fs } from 'fs';
import * as path from 'path';
import { OrganisationUrlStoreConfigForGit, UrlFolder, UrlFolderLoader, urlStorePathFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd, hasErrors } from "@laoban/utils";
import { fullExtension } from "@itsmworkbench/utils";

export const urlFolders = ( config: OrganisationUrlStoreConfigForGit ): UrlFolderLoader => {
  const orgAndNsToPath = urlStorePathFn ( config )
  async function load ( dirPath: string, ext: string ) {
    try {
      const entries = await fs.readdir ( dirPath, { withFileTypes: true } );
      const folder: UrlFolder = {
        name: path.basename ( dirPath ),
        children: []
      };

      const errors: string[] = [];
      for ( const entry of entries ) {
        console.log ( 'ext', ext, 'entry', entry.name, 'fullExtension', fullExtension ( entry.name ) )
        if ( !folder.children ) folder.children = []
        if ( entry.isDirectory () ) {
          const childFolder = await load ( path.join ( dirPath, entry.name ), ext );
          if ( hasErrors ( childFolder ) ) errors.push ( ...childFolder );
          else {
            if ( childFolder.children && childFolder.children.length > 0 ) folder.children.push ( childFolder );
          }
        } else if ( entry.isFile () && fullExtension ( entry.name ) === ext ) {
          folder.children.push ( { name: entry.name } );
        }
      }
      return errors.length > 0 ? errors : folder;
    } catch ( e: any ) {
      return [ 'urlFolders: ' + dirPath + ": " + e.toString () ];
    }

  }
  return async ( org: string, namespace: string, p?: string ): Promise<ErrorsAnd<UrlFolder>> => {
    const paths = orgAndNsToPath ( org, namespace );
    if ( hasErrors ( paths ) ) return paths
    const ext = config.nameSpaceDetails[ namespace ].extension
    const dirPath = path.join ( paths, (p ?? '') )
    return load ( dirPath, ext )
  };
}