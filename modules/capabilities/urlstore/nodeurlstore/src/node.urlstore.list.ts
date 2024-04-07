import fs from 'fs/promises';
import path from 'path';
import { applyPaging, ListNamesOrder, OrganisationUrlStoreConfigForGit, PageQuery, UrlListFn } from "@itsmworkbench/urlstore";
import { ErrorsAnd, mapErrors, mapErrorsK } from "@laoban/utils";
import { urlStorePathFn } from "@itsmworkbench/urlstore";
import { Dirent } from "node:fs";

export type FileInfo = {
  name: string;
  path: string;
  date: string; // ISO date string
};

// Load file information from a directory
async function loadFileInfo ( directoryPath: string, nameFn: ( s: string ) => string, filter?: string ): Promise<FileInfo[]> {
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
  const fileInfoPromises = files.filter ( file => file.isFile () && filterFn ( file ) ).map ( async file => {
    const filePath = path.join ( directoryPath, file.name );
    const stat = await fs.stat ( filePath );
    return {
      name: nameFn ( file.name ),
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


export const listNamesInPath = ( nameFn: ( name: string ) => string ) =>
  async ( directoryPath: string, query: PageQuery, order: ListNamesOrder, filter?: string ): Promise<ErrorsAnd<{ names: string[] }>> => {
    const files = await loadFileInfo ( directoryPath, nameFn, filter );
    return mapErrors ( await applySortOrder ( files, order ), ( { sortedFiles } ) =>
      ({ names: applyPaging ( sortedFiles, query ).map ( f => f.name ) }) )
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
export const listJustNamesInPath = listNamesInPath ( s => removeLastExtension ( path.parse ( s ).name ) );
export const listInStoreFn = ( config: OrganisationUrlStoreConfigForGit ): UrlListFn => {
  const orgAndNsToPath = urlStorePathFn ( config )
  return async ( { org, namespace, pageQuery, order, filter, path } ) =>
    mapErrorsK ( orgAndNsToPath ( org, namespace ), async ( p: string ) =>
      mapErrors ( await listJustNamesInPath ( path ? p + '/' + path : p, pageQuery, order, filter ),
        ( { names } ) => ({ org, namespace, path, names, page: pageQuery.page, total: names.length }) ) )
}
