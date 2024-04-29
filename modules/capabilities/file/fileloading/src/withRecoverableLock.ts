import { Timeservice } from "@itsmworkbench/utils";
import { constants, promises as fs } from "fs";
import { K0, K1, K2, K3, K4, K5, LogFn, RetryPolicyConfig, withRetry } from "@itsmworkbench/kleislis";
import path from "path";
import { useLogging } from "@itsmworkbench/nodekleislis";


//we want a file lock
//it has a time stamp in the file... and if that time stamp is too old, we want to recover the lock
// If we are using the filetimesystem we can be confident a bit in the timestamp 'clock' not being more than a second or so out from our time.. so it would be a good idea to have a recovery timeout
// of at least few seconds. That should be enough for most things: we don't want to design systems that lock things for long

export interface HasLockFilePath {
  lockFilePath: string

}
export interface RecoverableFileLockDetails extends HasLockFilePath {
  lockFilePath: string
  recoveryTimeout: number // after this amount of time we are free to try and claim the file lock
  timeservice: Timeservice

  debug?: boolean
}
function calcRetryPolicy ( details: RecoverableFileLockDetails ): RetryPolicyConfig {
  return {
    initialInterval: 10,
    maximumInterval: 1000,
    maximumAttempts: 4 * details.recoveryTimeout / 1000, // i.e much longer than the recovery timeout, but not forever. Note this really looks as though we want maximum time...
  }
}

export type SuccessfulRecoverableFileLockResult<T> = {
  result: T
}
export type FailedRecoverableFileLockResult = {
  error: string
  type: 'timeout' | 'lock'
}
export type RecoverableFileLockResult<T> = SuccessfulRecoverableFileLockResult<T> | FailedRecoverableFileLockResult

export async function createLock ( details: HasLockFilePath ): Promise<boolean> {
  const fd = await fs.open ( details.lockFilePath, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL )
  await fd.close ()
  return true
}
export async function canClaim ( details: RecoverableFileLockDetails ) {
  const stat = await fs.stat ( details.lockFilePath );
  const time = stat.mtime.getTime ()
  const currentTime = details.timeservice ()
  return currentTime - time > details.recoveryTimeout;
}

export async function seeIfCanClaim ( details: RecoverableFileLockDetails, log: LogFn, e: any ) {
  return await withRecoverableLock ( { ...details, lockFilePath: details.lockFilePath  + '.meta'}, async () => {
    if ( await canClaim ( details ) ) {
      if ( details.debug ) log ( 'DEBUG', 'deleting held lock ' + details.lockFilePath )
      await fs.unlink ( details.lockFilePath );
      if ( details.debug ) log ( 'DEBUG', 'claiming previously held lock ' + details.lockFilePath )
      return await createLock ( details );
    } else throw e
  } ) ()
}
export async function createLockAndCheckIfCanRecover ( details: RecoverableFileLockDetails ): Promise<void> {
  const log: LogFn = useLogging ()
  try {
    if ( details.debug ) log ( 'DEBUG', 'acquiring lock ' + details.lockFilePath )
    await createLock ( details );
    if ( details.debug ) log ( 'DEBUG', 'acquired lock ' + details.lockFilePath )
  } catch ( e ) {
    await fs.mkdir ( path.dirname ( details.lockFilePath ), { recursive: true } ) //because there is a chance we had an error that the directory didn't exist. After this it will
    if ( details.debug ) log ( 'DEBUG', 'lock held by someone else ' + details.lockFilePath, e )
    if ( await canClaim ( details ) ) {
      if ( details.debug ) log ( 'DEBUG', 'we might be able to claim held lock ' + details.lockFilePath, e )
      await seeIfCanClaim ( details, log, e );
      if ( details.debug ) log ( 'DEBUG', 'have claimed lock even though it was already held ' + details.lockFilePath, e )
    }
  }
}

export function withRecoverableLock<T> ( details: RecoverableFileLockDetails, fn: K0<T> ): K0<T>
export function withRecoverableLock<P1, T> ( details: RecoverableFileLockDetails, fn: K1<P1, T> ): K1<P1, T>
export function withRecoverableLock<P1, P2, T> ( details: RecoverableFileLockDetails, fn: K2<P1, P2, T> ): K2<P1, P2, T>
export function withRecoverableLock<P1, P2, P3, T> ( details: RecoverableFileLockDetails, fn: K3<P1, P2, P3, T> ): K3<P1, P2, P3, T>
export function withRecoverableLock<P1, P2, P3, P4, T> ( details: RecoverableFileLockDetails, fn: K4<P1, P2, P3, P4, T> ): K4<P1, P2, P3, P4, T>
export function withRecoverableLock<P1, P2, P3, P4, P5, T> ( details: RecoverableFileLockDetails, fn: K5<P1, P2, P3, P4, P5, T> ): K5<P1, P2, P3, P4, P5, T>
export function withRecoverableLock<T> ( details: RecoverableFileLockDetails, fn: ( ...args: any[] ) => Promise<T> ): ( ...args: any[] ) => Promise<T> {
  return async ( ...args: any[] ) => {

    await withRetry ( calcRetryPolicy ( details ), createLockAndCheckIfCanRecover ) ( details )
    const startTime = details.timeservice ()
    try {
      return await fn ( ...args )
    } finally {
      const now = details.timeservice ()
      if ( now - startTime > details.recoveryTimeout - 1000 ) { //a second before the recovery time out we can no longer do things. including releasing the lock
        throw new Error ( 'Recovery time out: we spent too long, and had to abort because of rules about file locks ' + details.lockFilePath )
      } else await fs.unlink ( details.lockFilePath )
    }
  }
}

