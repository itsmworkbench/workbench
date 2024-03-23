import { ErrorsAnd, NameAnd } from "@laoban/utils";

export interface SuccessfulShellResult {
  message: string
  code: 0
}
export function isSuccessfulShellResult ( t: ShellResult ): t is SuccessfulShellResult {
  return t.code === 0
}
export interface FailedShellResult {
  message?: string
  error: string
  code: number
}
export type ShellResult = SuccessfulShellResult | FailedShellResult


export type ExecuteInShellFn = ( cwd: string, cmd: string, encoding: BufferEncoding | undefined, debug?: boolean ) => Promise<ShellResult>;

export async function execute ( fn: ExecuteInShellFn, cwd: string, cmd: string, encoding: BufferEncoding | undefined, debug?: boolean ): Promise<ErrorsAnd<string>> {
  console.log ( 'execute :', cwd, cmd )
  const res = await fn ( cwd, cmd, encoding, debug )
  console.log ( 'execute - res:', res )
  if ( isSuccessfulShellResult ( res ) ) return res.message
  return [ res.error ]
}

