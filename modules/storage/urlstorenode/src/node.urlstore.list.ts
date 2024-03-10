import fs from 'fs/promises';
import path from 'path';
import { applyPaging, ListNamesOrder, OrganisationUrlStoreConfigForGit, PageQuery, UrlListFn } from "@itsmworkbench/url";
import { ErrorsAnd, mapErrors, mapErrorsK } from "@laoban/utils";
import { urlStorePathFn } from "@itsmworkbench/url/dist/src/url.pathops";

export type FileInfo = {
  name: string;
  path: string;
  date: string; // ISO date string
};

// Load file information from a directory
async function loadFileInfo ( directoryPath: string, nameFn: ( s: string ) => string ): Promise<FileInfo[]> {
  const files = await fs.readdir ( directoryPath, { withFileTypes: true } );
  const fileInfoPromises = files.filter ( file => file.isFile () ).map ( async file => {
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
  async ( directoryPath: string, query: PageQuery, order: ListNamesOrder ): Promise<ErrorsAnd<{ names: string[] }>> => {
    const files = await loadFileInfo ( directoryPath, nameFn );
    return mapErrors ( await applySortOrder ( files, order ), ( { sortedFiles } ) =>
      ({ names: applyPaging ( sortedFiles, query ).map ( f => f.name ) }) )
  }
function extractFirstPart ( input: string ): string {
  return input.includes ( '.' ) ? (input.split ( '.' ))[ 0 ] : input;
}
export const listJustNamesInPath = listNamesInPath ( s => extractFirstPart ( path.parse ( s ).name ) );
export const listInStoreFn = ( config: OrganisationUrlStoreConfigForGit ): UrlListFn => {
  const orgAndNsToPath = urlStorePathFn ( config )
  return async ( org, namespace, query, order ) =>
    mapErrorsK ( orgAndNsToPath ( org, namespace ), async ( path: string ) =>
      mapErrors ( await listJustNamesInPath ( path, query, order ),
        ( { names } ) => ({ org, namespace, names, page: query.page, total: names.length }) ) )
}
