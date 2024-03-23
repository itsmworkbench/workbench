import { GitOps } from "@itsmworkbench/git";
import * as fs from "fs";
import { isSuccessfulShellResult, ShellResult } from "@itsmworkbench/shell";
import { executeScriptInShell } from "@itsmworkbench/nodeshell";

export const shellGitsops = ( debug?: boolean ): GitOps => {
  return {
    init: async ( repo ) => {
      if ( debug ) console.log ( 'init', repo )
      await fs.promises.mkdir ( repo, { recursive: true } )
      if ( debug ) console.log ( 'made dir' )
      return executeScriptInShell ( repo, 'git init', 'utf8', debug );
    },
    commit: async ( repo, message: string ) => {
      let result1: ShellResult = await executeScriptInShell ( repo, 'git add .', 'utf8', debug );
      if ( debug ) console.log ( 'add', result1 )
      let result2 = await executeScriptInShell ( repo, `git commit -m "${message}"`, 'utf8', debug );
      if ( debug ) console.log ( 'commit', result2 )
      return result2;
    },
    status: ( repo ) => executeScriptInShell ( repo, 'git status', 'utf8', debug ),
    hashFor: async ( repo, fileName: string ) => {
      const result = await executeScriptInShell ( repo, `git hash-object ${fileName}`, 'utf8', debug );
      if ( isSuccessfulShellResult ( result ) ) return result.message.trim ();
      throw new Error ( `Could not get hash for ${fileName}. ${JSON.stringify ( result )}. Repo is ${repo}` )
    },
    sizeForHash: async ( repo, hash: string ): Promise<number> => {
      const result = await executeScriptInShell ( repo, `git cat-file -s ${hash}`, 'utf8', debug );
      if ( isSuccessfulShellResult ( result ) ) return Number.parseInt ( result.message.trim () );
      throw new Error ( `Could not get size for ${hash}. ${JSON.stringify ( result )}. Repo is ${repo}` )
    },
    fileFor: async ( repo, hash: string, encoding: BufferEncoding ) => {
      const result = await executeScriptInShell ( repo, `git cat-file -p ${hash}`, encoding, debug );
      if ( isSuccessfulShellResult ( result ) ) return result.message;
      throw new Error ( `Could not get file for ${hash}. ${JSON.stringify ( result )}. Repo is ${repo}` )
    }
  }
}
