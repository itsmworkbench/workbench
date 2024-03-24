import { findFileUp } from "@laoban/fileops";
import fs from "fs";
import { NameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit } from "@itsmworkbench/urlstore";
import { NameAnd } from "@laoban/utils";

const laobanDir = findFileUp ( process.cwd (), async f => {
  try {
    return await fs.promises.stat ( f + '/laoban.json' ).then ( stat => stat.isFile () );
  } catch ( e ) {return false}
} )
export const testDir = laobanDir.then ( d => d + '/tests/git' )

const parser = ( id: string, s: string ) => s + "_parsed";
const writer = ( s: any ) => s + "_written";
export const ns1: NameSpaceDetailsForGit = {
  pathInGitRepo: "namespace/path",
  extension: "txt",
  mimeType: "text/plain",
  parser,
  writer,
  encoding: "utf8"
};
export const allNameSpaceDetails: NameAnd<NameSpaceDetailsForGit> = { ns1 }
export const orgToDetails = ( baseDir: string ): OrganisationUrlStoreConfigForGit => ({
  baseDir,
  nameSpaceDetails: allNameSpaceDetails
});