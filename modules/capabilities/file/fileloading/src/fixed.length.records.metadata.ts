import { Buffer } from "buffer";
import { BufferFormatter, BufferParser } from "./fixed.length.records";

export type FileMetadata = {
  version: number;
  fileType: string;
}

export const formatMetadata: BufferFormatter<FileMetadata> = ( data ) => {
  if ( data.fileType.length !== 1 ) {
    throw new Error ( "File type must be exactly one character long." );
  }
  const buffer = Buffer.alloc ( 2 );
  buffer.writeUInt8 ( data.version, 0 );
  buffer.write ( data.fileType, 1, 1, 'utf-8' );
  return buffer;
};

// Parser for FileMetadata
export const parseMetadata: BufferParser<FileMetadata> = ( buffer ) => {
  const version = buffer.readUInt8 ( 0 );
  const fileType = buffer.toString ( 'utf-8', 1, 2 );
  return { version, fileType };
};