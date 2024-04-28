import fs from 'fs/promises';
import path from "node:path";
import * as os from "os";
import { canClaim, createLock, HasLockFilePath, RecoverableFileLockDetails, seeIfCanClaim, withRecoverableLock } from "./withRecoverableLock";

describe ( 'File Lock Tests', () => {
  let tempDir: string;
  // Setup a temporary directory before each test
  beforeEach ( async () => {
    tempDir = await fs.mkdtemp ( path.join ( os.tmpdir (), 'test-' ) );
  } );

  // Cleanup after each test
  afterEach ( async () => {
    await fs.rm ( tempDir, { recursive: true, force: true } );
  } );
  describe ( 'File Lock Tests', () => {


    test ( 'createLock should successfully create a lock file', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      const details: HasLockFilePath = { lockFilePath, };

      expect ( await createLock ( details ) ).toBe ( true );

      // Check that the lock file has been created
      await expect ( fs.access ( lockFilePath ) ).resolves.toBeUndefined ();
    } );

    test ( 'createLock should fail if the lock file already exists', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      const details: HasLockFilePath = { lockFilePath, };

      // Create the lock file manually before calling createLock
      await fs.writeFile ( lockFilePath, '' );

      // Now try to acquire the lock
      await expect ( createLock ( details ) ).rejects.toThrow ();
    } );
  } );
  describe ( 'canClaim Tests', () => {
    test ( 'canClaim returns true if the lock is older than the recovery timeout', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      await fs.writeFile ( lockFilePath, '' );
      const futureTimeWhenLockWillBeStale = Date.now () + 10000;

      const details: RecoverableFileLockDetails = {
        lockFilePath,
        recoveryTimeout: 5000, // 5 seconds
        timeservice: () => futureTimeWhenLockWillBeStale,
        debug: true
      };

      const result = await canClaim ( details );
      expect ( result ).toBe ( true );
    } );

    test ( 'canClaim returns false if the lock is newer than the recovery timeout', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      await fs.writeFile ( lockFilePath, '' );
      const recentTime = Date.now (); // current time

      const details: RecoverableFileLockDetails = {
        lockFilePath,
        recoveryTimeout: 5000, // 5 seconds
        timeservice: () => Date.now (),
        debug: true
      };

      const result = await canClaim ( details );
      expect ( result ).toBe ( false );
    } );
  } );
  describe ( 'seeIfCanClaim Tests with Real Files', () => {
    let tempDir: string;

    beforeEach ( async () => {
      tempDir = await fs.mkdtemp ( path.join ( os.tmpdir (), 'test-' ) );
    } );

    afterEach ( async () => {
      await fs.rmdir ( tempDir, { recursive: true } );
    } );

    test ( 'seeIfCanClaim successfully claims an old lock', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      await fs.writeFile ( lockFilePath, '' );
      // Set file mtime to a time clearly before the current time minus the recovery timeout
      const pastTime = new Date ( Date.now () - 10000 ); // 10 seconds ago
      await fs.utimes ( lockFilePath, pastTime, pastTime );

      const details: RecoverableFileLockDetails = {
        lockFilePath,
        recoveryTimeout: 5000, // 5 seconds
        timeservice: () => Date.now (),
        debug: true
      };

      const result = await seeIfCanClaim ( details, console.log, new Error ( 'Lock is held' ) );
      expect ( result ).toBe ( true );
      // Check if the file is gone indicating it was deleted and re-created
      await expect ( fs.access ( lockFilePath ) ).resolves.toBeUndefined ();

    } );

    test ( 'seeIfCanClaim fails to claim a recent lock and throws', async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );
      await fs.writeFile ( lockFilePath, '' );
      const recentTime = new Date ();
      await fs.utimes ( lockFilePath, recentTime, recentTime );

      const details: RecoverableFileLockDetails = {
        lockFilePath,
        recoveryTimeout: 5000, // 5 seconds
        timeservice: () => Date.now (),
        debug: true
      };

      await expect ( seeIfCanClaim ( details, console.log, new Error ( 'Lock is held' ) ) )
        .rejects.toThrow ( 'Lock is held' );
      // Ensure the file is still there, as the lock shouldn't have been claimed
      await expect ( fs.access ( lockFilePath ) ).resolves.toBeUndefined ();
    } );
  } );

  describe ( "withRecoverableLock", () => {
    it ( "should return the result if the lock is acquired", async () => {
      const lockFilePath = path.join ( tempDir, 'test.lock' );

      const details: RecoverableFileLockDetails = {
        lockFilePath,
        recoveryTimeout: 5000, // 5 seconds
        timeservice: () => Date.now (),
        debug: false
      };

      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
      expect ( await withRecoverableLock ( details, async () => 42 ) () ).toBe ( 42 );
    } )
  } )
} );