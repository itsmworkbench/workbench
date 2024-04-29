import fs from "fs";
import {  } from "@itsmworkbench/activities";
import { FileNamesForTemporal } from "./filenames";
import { ReplayEvent, ReplayEvents } from "@itsmworkbench/kleislis";


export const fileUpdateEventHistory = ( names: FileNamesForTemporal ) => ( workflowId: string ) => {
  const file = names.eventHistory ( workflowId );
  return ( e: ReplayEvent ) => fs.promises.appendFile ( file, `${JSON.stringify ( e )}\n` );
};


//TODO lots more work here. Have to deal with corruption and recover from the corruption
export const fileExistingState = ( names: FileNamesForTemporal ) => async ( workflowId: string ): Promise<ReplayEvents> => {
  const file = names.eventHistory ( workflowId );
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