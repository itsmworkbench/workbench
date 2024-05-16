import fs from 'fs/promises';
import { firstSegment, fromEntries, NameAnd } from "@laoban/utils";
import path from 'path';
import { IndexTreeNonFunctionals } from "./indexing.non.functionals";
import { addNonFunctionsToIndexer } from "./tree.index";
import { Indexer } from "./indexer.domain";
import { simpleTemplate } from "@itsmworkbench/utils";

type IndexFormater<T> = ( rootId: string, id: string, data: T ) => string;
export type InsertIntoFile<T> = {
  file: ( id: string ) => string;
  max: number;
  formatter: IndexFormater<T>
}

export function insertIntoFile<T> ( ins: InsertIntoFile<T> ): Indexer<T> {
  const { max } = ins;
  const allData: NameAnd<string[]> = {}
  return {
    start: async ( id: string ) => {
      allData[ id ] = allData[ id ] || [];
    },
    processLeaf: ( rootId, id ) => async ( t: T ) => {
      allData[ rootId ] = allData[ rootId ] || [];
      const data = allData[ rootId ];
      await addToFile ( ins.file ( rootId ), ins, data, ins.formatter ( rootId, id, t ) );
    },
    finished: async ( id: string ) => {
      allData[ id ] = allData[ id ] || [];
      const data = allData[ id ]
      await appendFile ( ins.file ( id ), data );
      allData[ id ] = [];
    },
    failed: async ( id: string, e: any ) => {
      allData[ id ] = [];
    }
  }
}

export const insertIntoFileWithNonFunctionals = ( rootDir: string, fileTemplate: string, _index: string, nf: IndexTreeNonFunctionals ) =>
  addNonFunctionsToIndexer ( nf, insertIntoFile ( {
    file: ( id: string ) => {
      const entries: [ string, string ][] = id.toString().split ( '/' ).map ( ( p, i ) => [ `id_${i}`, p ] );
      const res = simpleTemplate ( fileTemplate, { rootDir, index: _index, name: firstSegment ( id ), id, num: 0 } )
      return res;
    },
    max: 1000,
    formatter: ( rootId, _id, data ) =>
      `${JSON.stringify ( { index: { _index, _id } } )}\n${JSON.stringify ( data )}\n`
  } ) )
export const addToFile = async <T> ( file: string, ins: InsertIntoFile<T>, data: string[], s: string ) => {
  const { max } = ins;
  data.push ( s );
  if ( data.length >= max )
    await appendFile ( file, data );
};
export async function appendFile<T> ( file: string, data: string[] ) {
  const content = data.join ( '' );
  try {
    await fs.appendFile ( file, content );
  } catch ( e ) {
    await fs.mkdir ( path.dirname ( file ), { recursive: true } ) //only do after we have a problem. This is quicker in almost all cases
    await fs.appendFile ( file, content );
  }
}

