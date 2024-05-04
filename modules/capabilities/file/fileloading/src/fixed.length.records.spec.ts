import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileHandle } from "node:fs/promises";
import { FileDescriptionReader, FileDescriptionWriter, getRecord, withReadFileHandle, withWriteFileHandle, writeRecord } from "./fixed.length.records";

// Helper function to write initial data to a file
async function setupTestFile ( filePath: string, data: Buffer ): Promise<void> {
  const fileHandle: FileHandle = await fs.open ( filePath, 'w+' );
  try {
    await fileHandle.write ( data, 0 );
  } finally {
    await fileHandle.close ();
  }
}

describe ( 'getRecord function', () => {
  let tempDir: string;
  let filePath: string;

  beforeAll ( async () => {
    tempDir = os.tmpdir ();
    filePath = path.join ( tempDir, 'testfile.bin' );
    // Setup file with known data
    await setupTestFile ( filePath, Buffer.from ( 'XY0123456789ABCDEF', 'utf-8' ) );
  } );

  afterAll ( async () => {
    // Clean up: remove the temporary file
    await fs.unlink ( filePath );
  } );

  describe ( 'getRecord', () => {
    test ( 'reads correct data from the file', async () => {
      const fileDescription: FileDescriptionReader<string> = {
        recordSize: 8,
        metadataSize: 2,
        name: 'Test File',
        parser: ( buffer: Buffer ) => buffer.toString ( 'utf-8' )
      };

      const [ one, two ] = await withReadFileHandle ( filePath, async ( fileHandle: FileHandle ) => {
        const read = getRecord ( fileHandle ) ( fileDescription );
        return [ await read ( 0 ), await read ( 1 ) ]; // Read the first record
      } );

      expect ( one ).toEqual ( '01234567' );
      expect ( two ).toEqual ( '89ABCDEF' );
    } );

    test ( 'handles reading a non-existent record', async () => {
      const fileDescription: FileDescriptionReader<string> = {
        recordSize: 8,
        metadataSize: 2,
        name: 'Test File',
        parser: ( buffer: Buffer ) => buffer.toString ( 'utf-8' )
      };

      try {
        await withReadFileHandle ( filePath, async ( fileHandle: FileHandle ) => {
          const read = getRecord ( fileHandle ) ( fileDescription );
          return await read ( 2 ); // Attempt to read beyond the file size
        } )
      } catch ( e ) {
        expect ( e.message ).toMatch ( /Incomplete read/ );
      }
    } )
    it ( 'should throw a nice error if the parser fails - debug contents set', async () => {
      const fileDescription: FileDescriptionReader<string> = {
        recordSize: 8,
        metadataSize: 2,
        name: 'Test File',
        debugContent: true,
        parser: ( buffer: Buffer ) => { throw new Error ( 'Parser failed' ) }
      };

      try {
        await withReadFileHandle ( filePath, async ( fileHandle: FileHandle ) => {
          const read = await getRecord ( fileHandle ) ( fileDescription );
          return read ( 0 ); // Read the first record
        } );
      } catch ( e ) {
        expect ( e.message ).toEqual ( 'Error opening file: Error parsing record 0 from Test File: Parser failed\n' +
          '3031323334353637' );
      }
    } )
    it ( 'should throw a nice error if the parser fails - debug contents not set', () => {
      const fileDescription: FileDescriptionReader<string> = {
        recordSize: 8,
        metadataSize: 2,
        name: 'Test File',
        debugContent: false,
        parser: ( buffer: Buffer ) => { throw new Error ( 'Parser failed' ) }
      };

      expect ( async () => {
        await withReadFileHandle ( filePath, async ( fileHandle: FileHandle ) => {
          const read = getRecord ( fileHandle ) ( fileDescription );
          return read ( 0 ); // Read the first record
        } );
      } ).rejects.toThrow ( 'Error parsing record 0 from Test File: Parser failed' );
    } )
  } )
  describe ( 'writeRecord', () => {

    test ( 'writes data to a file correctly', async () => {
      const fileDescription: FileDescriptionWriter<string> = {
        recordSize: 16,
        metadataSize: 2,  // Assuming 'XY' is metadata
        name: 'Test File',
        formatter: ( data: string ) => Buffer.from ( data, 'utf-8' ),
        debugContent: true
      };

      await withWriteFileHandle ( filePath, async ( fileHandle ) => {
        const write = writeRecord<string> ( fileHandle ) ( fileDescription );
        await write ( 0, 'abcdefghij123456' );  // This should overwrite '0123456789ABCDEF'
      } );

      const fileContent = await fs.readFile ( filePath, 'utf-8' );
      expect ( fileContent ).toBe ( 'XYabcdefghij123456' );
    } );

    test ( 'throws an error when formatted data does not match record size', async () => {
      const fileDescription: FileDescriptionWriter<string> = {
        recordSize: 10,  // Intentionally wrong size
        metadataSize: 2,
        name: 'Test File',
        formatter: ( data: string ) => Buffer.from ( data, 'utf-8' ),
        debugContent: false
      };

      await expect ( withWriteFileHandle ( filePath, async ( fileHandle ) => {
        const write = writeRecord<string> ( fileHandle ) ( fileDescription );
        await write ( 0, '1234567890abcdef' );
      } ) ).rejects.toThrow ( /Formatted data does not match record size/ );
    } );

  } );
} );
