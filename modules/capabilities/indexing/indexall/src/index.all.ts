import { indexGitHubRepo } from "@itsmworkbench/indexing_github";
import { consoleIndexTreeLogAndMetrics, defaultIndexTreeNfs, IndexingContext, insertIntoFileWithNonFunctionals, stopNonFunctionals } from "@itsmworkbench/indexing";
import { consoleIndexForestLogAndMetrics } from "@itsmworkbench/indexing/src/forest.index";


const token = process.env.GITHUB_TOKEN;
if ( token === null || token == undefined ) {
  throw new Error ( 'GITHUB_TOKEN not set in environment' )
}
const indexingContext: IndexingContext = ({
  authFn: async ( details ) =>
    ({ "Authorization": `Bearer ${token}` }), //could have used some other strategy but this is ok for now
  treeLogAndMetrics: consoleIndexTreeLogAndMetrics,
  forestLogAndMetrics: consoleIndexForestLogAndMetrics,
  fetch: async ( url, options ) => {
    console.log ( `Fetching: ${url}` )
    const result = await fetch ( url, options );
    return result;
  }
});


//Repo name will be either users/repo/reponame or orgs/repo/reponame. This allows us to handle either user or org repos

export const githubNfs = defaultIndexTreeNfs ()
export const githubOneRepoWF =
               async ( reponame: string ) =>
                 indexGitHubRepo ( githubNfs, indexingContext,
                   insertIntoFileWithNonFunctionals ( 'target/indexing/github', 'github', githubNfs ) ) ( reponame )

console.log ( 'hello world' )

// githubOneRepoWF ( 'phil-rice/javaoptics' ).then ( () => {
//   console.log ( 'done' )
//   stopNonFunctionals ( githubNfs )
// } )