import { constants, promises as fs } from 'fs';
import { DateTimeService, Timeservice } from "@itsmworkbench/utils";

const wait = ( ms: number ) => new Promise ( resolve => setTimeout ( resolve, ms ) );

export interface LockFileDetails {
  debug?: boolean
  lockFilePath: string
  timeout: number
  timeservice: Timeservice
  id?: string // An optional identifier to include in the lock file. Mostly for debugging purposes
}
export function fileLocking ( filePath: string, timeservice?: Timeservice ): LockFileDetails {
  return { lockFilePath: filePath + '.lock', timeout: 5000, timeservice: timeservice ? timeservice : DateTimeService }
}
// Attempts to acquire a lock
async function acquireLock ( { lockFilePath, timeout, debug, timeservice }: LockFileDetails ): Promise<boolean> {
  const startTime = timeservice ();
  while ( timeservice () - startTime < timeout ) {
    try {
      if ( debug ) console.log ( 'acquiring lock', lockFilePath )
      const fd = await fs.open ( lockFilePath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL );
      await fd.close (); //close the file descriptor. But importantly the file still exists
      if ( debug ) console.log ( 'acquired lock', lockFilePath )
      return true; // Lock acquired
    } catch ( error:any ) {
      if ( debug ) console.log ( 'error acquiring lock', lockFilePath, error )
      if ( error.code === 'EEXIST' || error.code === 'EPERM' ) {
        await wait ( 100 ); // Wait before retrying if the lock exists
        continue;
      }
      throw error; // An unexpected error occurred
    }
  }
  return false; // Timeout reached without acquiring the lock
}


async function releaseLock ( lockFilePath: string, debug?: boolean ): Promise<void> {
  if ( debug ) console.log ( 'releasing lock', lockFilePath )
  await fs.unlink ( lockFilePath );
}

// Higher-order function to manage file locking around the execution of a given function
export async function withFileLock<T> (
  details: LockFileDetails,
  action: () => Promise<T>,
): Promise<T> {
  if ( await acquireLock ( details ) ) {
    try {
      return await action ();
    } finally {
      await releaseLock ( details.lockFilePath, details.debug );
    }
  } else {
    throw new Error ( `Failed to acquire lock ${JSON.stringify ( details )} within the specified timeout ` );
  }
}
