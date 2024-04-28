import { Timeservice } from "@itsmworkbench/utils";
import { LockFileDetails } from "./with.lock";
import { constants, promises as fs } from "fs";


//we want a file lock
//it has a time stamp in the file... and if that time stamp is too old, we want to recover the lock
// If we are using the filetimesystem we can be confident a bit in the timestamp 'clock' not being more than a second or so out from our time.. so it would be a good idea to have a recovery timeout
// of at least few seconds. That should be enough for most things: we don't want to design systems that lock things for long

export interface RecoverableFileLockDetails extends LockFileDetails {
  recoveryTimeout: number // after this amount of time we are free to try and claim the file lock
  retryTime?: number
  jitter?: number

}

export type SuccessfulRecoverableFileLockResult<T> = {
  result: T
}
export type FailedRecoverableFileLockResult = {
  error: string
  type: 'timeout' | 'lock'
}
export type RecoverableFileLockResult<T> = SuccessfulRecoverableFileLockResult<T> | FailedRecoverableFileLockResult

async function tryCreateLockFile ( details: LockFileDetails ) {
  try {
    const fd = await fs.open ( details.lockFilePath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL );
    const timestamp = details.timeservice (); // Get the current time from the timeservice
    await fs.writeFile ( fd, JSON.stringify ( { timestamp, id } ) );
    await fd.close ();
    return true;
  } catch ( error ) {
    if ( error.code === 'EEXIST' ) {
      return false; // File already exists, lock not acquired
    }
    throw error; // Rethrow unexpected errors to be handled by the caller
  }
}
function jitterWait ( baseDelay: number, jitter: number ): Promise<void> {
  const waitTime = baseDelay + Math.floor ( Math.random () * jitter );
  console.log ( `Waiting ${waitTime} ms before next attempt.` );
  return new Promise ( resolve => setTimeout ( resolve, waitTime ) );
}


async function handleLockFileExists ( details: RecoverableFileLockDetails ): Promise<boolean> {
  try {
    const fileContent = await fs.readFile ( details.lockFilePath, { encoding: 'utf8' } );
    const { timestamp } = JSON.parse ( fileContent );
    const currentTime = details.timeservice ();

    if ( currentTime - timestamp > details.recoveryTimeout ) {
      if ( details.debug ) console.log ( 'Lock is stale, attempting to recover...' );
      await fs.unlink ( details.lockFilePath );
      return tryCreateLockFile ( details );
    }
    return false;
  } catch ( error ) {
    if ( details.debug ) console.error ( 'An error occurred while handling the existing lock file:', error );
    throw error;
  }
}
async function acquireLockWithRetry ( details: RecoverableFileLockDetails, id: string, baseDelay: number, jitter: number ): Promise<void> {
  const startTime = Date.now ();
  while ( true ) {
    if ( await tryCreateLockFile ( details ) ) {
      if ( details.debug ) console.log ( 'Lock successfully acquired.' );
      break;
    }

    if ( await handleLockFileExists ( details ) ) {
      if ( details.debug ) console.log ( 'Lock recovered and successfully acquired.' );
      break;
    }

    if ( Date.now () - startTime > details.timeout ) {
      if ( details.debug ) console.error ( 'Failed to acquire lock: Timeout exceeded.' );
      break;
    }

    await jitterWait ( baseDelay, jitter );
  }
}
