import fs from "fs";
import { FileNamesForTemporal } from "./filenames";
import { BasicReplayEvents, ReplayEvent } from "@itsmworkbench/kleislis";
import { WorkflowAndInstanceId } from "@itsmworkbench/workflow";
import path from "node:path";


export const fileUpdateEventHistory = ( names: FileNamesForTemporal ) => ( wf: WorkflowAndInstanceId ) => {
  const file = names.eventHistory ( wf );
  return async ( e: ReplayEvent ) => {
    const data = `${JSON.stringify ( e )}\n`;
    try {
      return await fs.promises.appendFile ( file, data );
    } catch ( e ) {
      await fs.promises.mkdir ( path.dirname ( file ), { recursive: true } );
      return await  fs.promises.appendFile ( file, data);
    }
  }
};


//TODO lots more work here. Have to deal with corruption and recover from the corruption
export const fileExistingState = ( names: FileNamesForTemporal ) => async ( wf: WorkflowAndInstanceId ): Promise<BasicReplayEvents> => {
  const file = names.eventHistory ( wf );
  try {
    const data = await fs.promises.readFile ( file, 'utf8' );
    try {
      return data.split ( '\n' ).filter ( x => x !== '' ).map ( x => JSON.parse ( x ) );
    } catch ( e ) {
      console.error ( `Error parsing events from file ${file}. Error: ${e.message}\n${data}` );
      return [];
    }
  } catch ( e ) {
    if ( e.code === 'ENOENT' ) return [];
    throw e;
  }
};