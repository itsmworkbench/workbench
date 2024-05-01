import fs from "fs";
import { FileNamesForTemporal } from "./filenames";
import { NameAnd } from "@laoban/utils";
import { BasicReplayEvents } from "@itsmworkbench/kleislis";

export async function createTempDir () {
  // let prefix = os.tmpdir () + "/filenames";
  let prefix = "target/";
  await fs.promises.mkdir ( prefix, { recursive: true } );
  return await fs.promises.mkdtemp ( prefix, { encoding: 'utf8' } );
}

export async function removeTempDir ( dir ) {
  await fs.promises.rm ( dir, { recursive: true } );
}

export function setEvents ( names: FileNamesForTemporal, workspaceInstanceId: string, events: BasicReplayEvents ) {
  const file = names.eventHistory ( workspaceInstanceId );
  return fs.promises.writeFile ( file, events.map ( e => JSON.stringify ( e ) + '\n' ).join ( '' ) )
}

export async function loadEvents ( names: FileNamesForTemporal, workspaceInstanceId: string ): Promise<BasicReplayEvents> {
  const file = names.eventHistory ( workspaceInstanceId );
  const lines = await fs.promises.readFile ( file, 'utf8' )
  try {
    const result = lines.split ( '\n' ).filter ( x => x !== '' ).map ( x => JSON.parse ( x ) )
    return result
  } catch ( e ) {
    console.error ( `Error loading events from file ${file}. Error: ${e.message}\n${lines}` )
    return []
  }
}
export async function loadMetrics ( names: FileNamesForTemporal, workspaceInstanceId: string ): Promise<NameAnd<number>> {
  const file = names.metrics ( workspaceInstanceId );
  console.log ( 'loading metrics from file', file )
  return fs.promises.readFile ( file, 'utf8' ).then ( data => JSON.parse ( data ) )
}