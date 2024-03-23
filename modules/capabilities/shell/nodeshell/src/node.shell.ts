import cp from "child_process";
import { ShellResult, ExecuteInShellFn } from "@itsmworkbench/shell"  ;

export const executeScriptInShell: ExecuteInShellFn = ( cwd: string, cmd: string, encoding: BufferEncoding | undefined, debug?: boolean ): Promise<ShellResult> => {
  if ( encoding === undefined ) encoding = 'utf8'
  if ( debug ) console.log ( 'executeScriptInShell', cwd, cmd.trim () )
  return new Promise<ShellResult> ( resolve => {
    cp.exec ( cmd, { cwd, env: process.env, encoding }, ( error, stdout, stdErr ) => {
      if ( debug ) console.log ( 'exec - error ', error )
      if ( debug ) console.log ( 'exec - stdout', stdout )
      if ( debug ) console.log ( 'exec - strError', stdErr )
      if ( stdErr === '' && (error === null || error.code === 0) )
        resolve ( { message: stdout.toString (), code: 0 } )
      else
        resolve ( { message: stdout.toString (), error: stdErr.toString (), code: error?.code } )
    } )
  } );
};
