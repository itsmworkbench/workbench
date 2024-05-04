import { promises as fs } from 'fs';
import { Buffer } from 'buffer';
import { FileHandle } from "node:fs/promises";


export type FileDescriptionCommon = {
  recordSize: number;
  metadataSize: number;
  name: string;
  debugContent?: boolean;
}
export interface FileDescriptionReader<T> extends FileDescriptionCommon {
  parser: BufferParser<T>
}
export interface FileDescriptionWriter<T> extends FileDescriptionCommon {
  formatter: BufferFormatter<T>;
}
export interface FileDescription<T> extends FileDescriptionReader<T>, FileDescriptionWriter<T> {}

export type BufferParser<T> = ( buffer: Buffer ) => T;
export type BufferFormatter<T> = ( data: T ) => Buffer;


export function startPositionForRecord ( fileDescription: FileDescriptionCommon, recordNum: number ) {
  return fileDescription.metadataSize + recordNum * fileDescription.recordSize;
}

export async function withReadFileHandle<T> ( path: string, callback: ( fileHandle: FileHandle ) => Promise<T> ): Promise<T> {
  try {
    const fileHandle = await fs.open ( path, 'r' );
    try {
      return await callback ( fileHandle );
    } finally {
      await fileHandle.close ();
    }
  } catch ( e ) {
    throw new Error ( "Error opening file: " + e.message );
  }
}
export const getRecord = ( fileHandle: FileHandle ) => <T> ( fileDescription: FileDescriptionReader<T> ) => async ( recordNum: number ): Promise<T> => {
  const buffer = Buffer.alloc ( fileDescription.recordSize );
  const { bytesRead } = await fileHandle.read ( buffer, 0, fileDescription.recordSize, startPositionForRecord ( fileDescription, recordNum ) );
  if ( bytesRead !== fileDescription.recordSize ) {
    throw new Error ( `Incomplete read: Expected to read ${fileDescription.recordSize} bytes from ${fileDescription.name} but only read ${bytesRead} bytes.` );
  }
  try {
    return fileDescription.parser ( buffer );
  } catch ( e ) {
    const bufferContents = fileDescription.debugContent ? buffer.toString ( 'hex' ) : '';
    throw new Error ( `Error parsing record ${recordNum} from ${fileDescription.name}: ${e.message}\n${bufferContents}` );
  } finally {
    buffer.fill ( 0 )
  }
};


export async function withWriteFileHandle<T> ( path: string, callback: ( fileHandle: FileHandle ) => Promise<T> ): Promise<T> {
  try {
    const fileHandle = await fs.open ( path, 'r+' );
    try {
      return await callback ( fileHandle );
    } finally {
      await fileHandle.close ();
    }
  } catch ( e ) {
    throw new Error ( "Error opening file: " + e.message );
  }
}

function formatWithNiceErrorMessage<T> ( fileDescription: FileDescriptionWriter<T>, data: T ) {
  function getContents () {
    try {
      return fileDescription.debugContent ? JSON.stringify ( data ) : '';
    } catch ( e ) {
      return `Data serialization failed, Was type ${typeof data}. Default toString used: ${data.toString ()}`;
    }
  }
  try {
    return fileDescription.formatter ( data );
  } catch ( e ) {
    const contents = getContents ();
    throw new Error ( `Error formatting data for ${fileDescription.name}: ${e.message}\n${contents}` );
  }
}
export const writeRecord = <T> ( fileHandle: FileHandle ) => ( fileDescription: FileDescriptionWriter<T> ) => async ( recordNum: number, data: T ): Promise<void> => {
  const buffer = formatWithNiceErrorMessage ( fileDescription, data );
  try {
    if ( buffer.length !== fileDescription.recordSize ) {
      throw new Error ( `Formatted data does not match record size: Expected ${fileDescription.recordSize} bytes, got ${buffer.length} bytes.` );
    }
    const position = startPositionForRecord ( fileDescription, recordNum );
    const { bytesWritten } = await fileHandle.write ( buffer, 0, buffer.length, position );
    if ( bytesWritten !== buffer.length ) {
      throw new Error ( `Incomplete write: Expected to write ${buffer.length} bytes to ${fileDescription.name} but only wrote ${bytesWritten} bytes.` );
    }
  } finally {
    buffer.fill ( 0 )
  }
};
