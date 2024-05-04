import { gitRepoIndexer } from "@itsmworkbench/indexing_github";
import { consoleIndexTreeLogAndMetrics, defaultIndexTreeNfs, IndexingContext, insertIntoFileWithNonFunctionals, stopNonFunctionals } from "@itsmworkbench/indexing";



const token = process.env.GITHUB_TOKEN;
if ( token === null || token == undefined ) {
  throw new Error ( 'GITHUB_TOKEN not set in environment' )
}
const indexingContext: IndexingContext = {
  authFn: async ( details ) =>
    ({ "Authorization": `Bearer ${token}` }), //could have used some other strategy but this is ok for now
  logAndMetrics: consoleIndexTreeLogAndMetrics,
  fetch: async ( url, options ) => {
    console.log ( `Fetching: ${url}` )
    const result = await fetch ( url, options );
    return result;
  }
}


//Repo name will be either users/repo/reponame or orgs/repo/reponame. This allows us to handle either user or org repos

export const githubNfs = defaultIndexTreeNfs ()
export const githubOneRepoWF =
               async ( reponame: string ) =>
                 gitRepoIndexer ( githubNfs, indexingContext,
                   insertIntoFileWithNonFunctionals ( 'target/indexing/github', 'github', githubNfs ) ) ( reponame )

console.log ( 'hello world' )

// githubOneRepoWF ( 'phil-rice/javaoptics' ).then ( () => {
//   console.log ( 'done' )
//   stopNonFunctionals ( githubNfs )
// } )