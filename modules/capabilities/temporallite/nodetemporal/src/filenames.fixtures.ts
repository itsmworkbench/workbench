import fs from "fs";
import { FileNamesForTemporal } from "./filenames";
import { NameAnd } from "@laoban/utils";
import { BasicReplayEvents } from "@itsmworkbench/kleislis";
import { WorkflowAndInstanceId } from "@itsmworkbench/workflow";
import path from "node:path";

export async function createTempDir () {
  // let prefix = os.tmpdir () + "/filenames";
  let prefix = "target/";
  await fs.promises.mkdir ( prefix, { recursive: true } );
  return await fs.promises.mkdtemp ( prefix, { encoding: 'utf8' } );
}

export async function removeTempDir ( dir ) {
  await fs.promises.rm ( dir, { recursive: true } );
}

export async function setEvents ( names: FileNamesForTemporal, wf: WorkflowAndInstanceId, events: BasicReplayEvents ) {
  const file = names.eventHistory ( wf );
  await fs.promises.mkdir(path.dirname(file), {recursive: true})
  return await fs.promises.writeFile ( file, events.map ( e => JSON.stringify ( e ) + '\n' ).join ( '' ) )
}

export async function loadEvents ( names: FileNamesForTemporal, wf: WorkflowAndInstanceId ): Promise<BasicReplayEvents> {
  const file = names.eventHistory ( wf );
  try {
    const lines = await fs.promises.readFile ( file, 'utf8' )
    try {
      const result = lines.split ( '\n' ).filter ( x => x !== '' ).map ( x => JSON.parse ( x ) )
      return result
    } catch ( e ) {
      console.error ( `Error loading events from file ${file}. Error: ${e.message}\n${lines}` )
      return []
    }
  } catch ( e ) {
    console.error ( `Error loading events from file ${file}. Error: ${e.message}` )
    return []
  }
}

export async function loadMetrics ( names: FileNamesForTemporal, wf: WorkflowAndInstanceId ): Promise<NameAnd<number>> {
  const file = names.metrics ( wf );
  console.log ( 'loading metrics from file', file )
  return fs.promises.readFile ( file, 'utf8' ).then ( data => JSON.parse ( data ) )
}