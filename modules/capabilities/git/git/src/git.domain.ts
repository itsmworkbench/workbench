import { ShellResult } from "@itsmworkbench/shell";


export interface GitOps {
  init: ( repo: string ) => Promise<ShellResult>
  commit: ( repo: string, message: string ) => Promise<ShellResult>
  hashFor: ( repo: string, fileName: string ) => Promise<string>
  sizeForHash: ( repo: string, hash: string ) => Promise<number>
  fileFor: ( repo: string, hash: string, encoding: BufferEncoding ) => Promise<string>
  status: ( repo: string ) => Promise<ShellResult>
}
