import fs from 'fs/promises';
import path from 'path';
import { applyPaging, ListNamesOrder, OrganisationUrlStoreConfigForGit, PageQuery, UrlListFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd, mapErrors, mapErrorsK } from "@laoban/utils";
import { urlStorePathFn } from "@itsmworkbench/urlstore";
import { Dirent } from "node:fs";
import { fullExtension } from "@itsmworkbench/utils";

export type FileInfo = {
  name: string;
  path: string;
  isFile: boolean
  date: string; // ISO date string
};

// Load file information from a directory
async function loadFileInfo ( directoryPath: string, nameFn: ( s: string ) => string, extension: string, filter?: string ): Promise<FileInfo[]> {
  async function readIt () {
    try {
      return await fs.readdir ( directoryPath, { withFileTypes: true } );
    } catch ( e ) {
      return []
    }
  }
  const files = await readIt ();
  const lcFilter = filter?.toLowerCase ()
  const filterFn = filter ? ( file: Dirent ) => file.name.toLowerCase ().includes ( lcFilter ) : () => true;
  const filesWithExtensionOrDir = files.filter ( file => fullExtension ( file.name ) === extension || file.isDirectory ()  );
  const fileInfoPromises = filesWithExtensionOrDir.filter ( file => filterFn ( file ) ).map ( async file => {
    const filePath = path.join ( directoryPath, file.name );
    const stat = await fs.stat ( filePath );
    return {
      name: nameFn ( file.name ),
      isFile: file.isFile (),
      path: filePath,
      date: stat.mtime.toISOString (),
    };
  } );
  return Promise.all ( fileInfoPromises );
}
type SortFn = ( a: FileInfo, b: FileInfo ) => number;
function getSortFunction ( order: ListNamesOrder ): ErrorsAnd<SortFn> {
  switch ( order ) {
    case 'date':
      return ( a, b ) => new Date ( b.date ).getTime () - new Date ( a.date ).getTime ();
    case 'name':
      return ( a, b ) => a.name.localeCompare ( b.name );
    default:
      return [ `Unsupported sort order: ${order}. Legal values are ['name', 'date']` ]
  }
}
const applySortOrder = ( files: FileInfo[], order: ListNamesOrder ): ErrorsAnd<{ sortedFiles: FileInfo[] }> =>
  mapErrors ( getSortFunction ( order ), sortFn => ({ sortedFiles: files.sort ( sortFn ) }) )

type Files = {
  names: string[]
  dirs: string[]
}

export const listNamesInPath = ( nameFn: ( name: string ) => string, extension: string ) =>
  async ( directoryPath: string, query: PageQuery, order: ListNamesOrder, filter?: string, ): Promise<ErrorsAnd<Files>> => {
    const files = await loadFileInfo ( directoryPath, nameFn,extension, filter  );
    const result = mapErrors ( await applySortOrder ( files, order ),
      ( { sortedFiles } ) => {
        const files = sortedFiles.filter ( f => f.isFile )
        const paged = applyPaging ( files, query );
        const names = paged.map ( f => f.name );
        return ({
          names: names,
          dirs: sortedFiles.filter ( f => !f.isFile ).map ( f => f.name )
        });
      } );
    return result
  }

export function removeLastExtension ( path: string ): string {
  // Split the path by dots to separate extensions
  const parts = path.split ( '.' );

  // If there's only one part, it means there's no extension to remove
  if ( parts.length === 1 ) {
    return path;
  }

  // Remove the last part (extension)
  parts.pop ();

  // Rejoin the remaining parts
  return parts.join ( '.' );
}
export const listInStoreFn = ( config: OrganisationUrlStoreConfigForGit ): UrlListFn => {
  const orgAndNsToPath = urlStorePathFn ( config )
  return async ( { org, namespace, pageQuery, order, filter, path: thePath } ) => {
    const extension = config.nameSpaceDetails[ namespace ]?.extension
    const listJustNamesInPath = listNamesInPath ( s => removeLastExtension ( path.parse ( s ).name ), extension );
    if ( extension === undefined ) return [ `namespace ${namespace} not found` ]
    return mapErrorsK ( orgAndNsToPath ( org, namespace ), async ( p: string ) =>
      mapErrors ( await listJustNamesInPath ( thePath ? p + '/' + thePath : p, pageQuery, order, filter ),
        ( { names, dirs } ) => ({ org, namespace, path: thePath, names, dirs, page: pageQuery.page, total: names.length }) ) );
  }
}
