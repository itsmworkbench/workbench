import { githubNfs, githubOneRepoWF } from "./index.all";
import { stopNonFunctionals } from "@itsmworkbench/indexing";


describe ( 'githubOneRepoWF', () => {
  it ( 'should fetch from github', async () => {
    try {
      await githubOneRepoWF ( 'phil-rice/typescriptDragons' )
    } finally {
      console.log ( 'done' )
      stopNonFunctionals ( githubNfs )
    }

  } )
} )