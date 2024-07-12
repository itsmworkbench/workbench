import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const formatJSONFiles = async ( directory: string, fn: ( raw: string ) => Promise<string> ) => {
  const files = await fs.promises.readdir ( directory );
  for ( const file of files ) {
    const filePath = path.join ( directory, file );
    if ( path.extname ( filePath ) === '.json' ) {
      const content = await fs.promises.readFile ( filePath, 'utf8' );
      const changed = await fn ( content );
      await fs.promises.writeFile ( filePath, changed, 'utf8' );
    }
  }
};

type ExecuteCommand = ( command: string, dir?: string, ) => Promise<string>

export function execute ( command: string, cwd?: string ): Promise<string> {
  return new Promise ( ( resolve, reject ) => {
    exec ( command, { cwd }, ( error, stdout, stderr ) => {
      if ( error ) {
        reject ( error );
      }
      resolve ( stdout );
    } );
  } );
}

export type TikaParams = {
  input_directory: string;
  output_directory: string
  cmdMaker?: MakeTikaCommand
  executeCommand?: ExecuteCommand
}

type MakeTikaCommand = ( p: TikaParams ) => string
export function makeTiKaCommand ( p: TikaParams ) {
  return `java -jar tika-app.jar --jsonRecursive -i ${p.input_directory} -o ${p.output_directory}`
}

const runTikaAppHandler = async ( { input_directory, output_directory, cmdMaker, executeCommand }: TikaParams ) => {
  if ( !cmdMaker ) cmdMaker = makeTiKaCommand;
  if ( !executeCommand ) executeCommand = execute;
  const command = cmdMaker ( { input_directory, output_directory } );
  await fs.promises.mkdir ( input_directory, { recursive: true } )
  return await executeCommand ( command );
};

export default runTikaAppHandler;