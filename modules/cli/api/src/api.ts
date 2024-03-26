import { ContextAndStats, defaultShowsError, handleFile, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { chainOfResponsibility } from "@runbook/utils";
import { fileLoading, fileLocking, loadStringIncrementally, withFileLock } from "@itsmworkbench/fileloading";
import { promises as fs } from 'fs';
import { IdStore, IdStoreResult, isBadIdStoreResult } from "@itsmworkbench/idstore";
import { ListIds } from "@itsmworkbench/listids";
import { getUrls, listUrls, putUrls } from "./api.for.url.store";
import { NameSpaceDetails, UrlStore } from "@itsmworkbench/urlstore";
import { NameAnd } from "@laoban/utils";
import { executeAIForEmail, executeAIForKnownVariables, executeAIForVariables } from "./api.for.ai";
import { AI } from "@itsmworkbench/ai";
import { Mailer } from "@itsmworkbench/mailer";
import { Sqler } from "@itsmworkbench/sql";
import { apiForSqlerPosts } from "./api.for.sqler";
import { apiForMailer } from "./api.for.mailer";
import { apiForFetchEmailer } from "./api.for.fetchemailer";
import { FetchEmailer } from "@itsmworkbench/fetchemail";


export const ids = ( idstore: IdStore, debug: boolean ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => ctx.context.request.path.startsWith ( '/id/' ) && ctx.context.request.method === 'GET',
  apply: async ( ctx ) => {
    const id = ctx.context.path.slice ( 4 )
    if ( debug ) console.log ( 'found ids', ctx.context.path, id )
    const result: IdStoreResult = await idstore ( id, 'string' )
    if ( isBadIdStoreResult ( result ) ) {
      ctx.context.status = 500
      ctx.context.body = result.error
    } else {
      ctx.context.status = 200
      ctx.context.body = result.result
      ctx.context.type = result.mimeType
    }
  }
})

export const eventsPF: KoaPartialFunction = {
  isDefinedAt: ( ctx ) => ctx.stats?.isFile () && ctx.context.request.method === 'GET',
  apply: async ( ctx ) => {
    const query = ctx.context.request.query
    const start = Number.parseInt ( query.start || "0" )
    const result = await loadStringIncrementally ( fileLoading ( ctx.reqPathNoTrailing ) ) ( start )
    ctx.context.body = `${result.newStart}\n${result.result}`
  }
}
export function getIdsPF ( getIds: ListIds ): KoaPartialFunction {
  return {
    isDefinedAt: ( ctx ) => {
      // Match the path against the regex pattern and check for 'GET' method
      const match = /\/ids\/([^\/]+)/.exec ( ctx.context.request.path );
      const isGetMethod = ctx.context.request.method === 'GET';
      return match && isGetMethod
    },
    apply: async ( ctx ) => {
      const match = /\/ids\/([^\/]+)/.exec ( ctx.context.request.path );
      const type = match[ 1 ];
      // Use the 'type' captured and attached to the context in 'isDefinedAt'
      try {
        console.log ( 'getIdsPF', type )
        const ids = await getIds ( type );
        ctx.context.body = JSON.stringify ( ids ); // Set the response body to the result
        ctx.context.set ( 'Content-Type', 'application/json' );
      } catch ( e ) {
        ctx.context.status = 404;
        ctx.context.body = e.toString ();
      }

    }
  }
};

export const appendPostPF: KoaPartialFunction = {
  isDefinedAt: ( ctx ) => ctx.stats?.isFile () && ctx.context.request.method === 'POST',
  apply: async ( ctx ) => {
    const body: any = await ctx.context.request.body // should be parsed according to content type
    if ( typeof body !== 'object' ) throw new Error ( `Expected object, got ${typeof body}. Body is ${JSON.stringify ( body )}` )
    const str = `${JSON.stringify ( body )}\n` // one line is important

    await withFileLock ( fileLocking ( ctx.reqPathNoTrailing ), async () => {
        try {
          await fs.appendFile ( ctx.reqPathNoTrailing, str );
          ctx.context.status = 200;
          ctx.context.body = 'JSON appended to file successfully';
        } catch ( error ) {
          console.error ( 'Error appending to file:', error );
          ctx.context.status = 500;
          ctx.context.body = 'Internal Server Error';
        }
      }
    )
  }
}

export const wizardOfOzApiHandlers = ( ai: AI,
                                       debug: boolean,
                                       details: NameAnd<NameSpaceDetails>,
                                       urlStore: UrlStore,
                                       mailer: Mailer,
                                       fetchEmailer: FetchEmailer,
                                       sqler: Sqler,
                                       ...handlers: KoaPartialFunction[] ): ( from: ContextAndStats ) => Promise<void> =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    executeAIForVariables ( ai.variables ),
    executeAIForEmail ( ai.emails ),
    executeAIForKnownVariables ( ai.knownVariables ),
    listUrls ( urlStore.list ),
    getUrls ( urlStore ),
    putUrls ( urlStore.save, details ),
    apiForSqlerPosts ( sqler ),
    apiForMailer ( mailer ),
    apiForFetchEmailer ( fetchEmailer ),
    // appendPostPF,
    handleFile,
    ...handlers,
    notFoundIs404,
  )