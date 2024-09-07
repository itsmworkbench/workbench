import { ContextAndStats, defaultShowsError, handleFile, KoaPartialFunction, notFoundIs404 } from "@itsmworkbench/koa";
import { fileLoading, fileLocking, loadStringIncrementally, withFileLock } from "@itsmworkbench/fileloading";
import { promises as fs } from 'fs';
import { NameSpaceDetails, UrlStore } from "@itsmworkbench/urlstore";
import { NameAnd } from "@laoban/utils";
import { executeAIForEmail, executeAIForKnownVariables, executeAIForVariables } from "@itsmworkbench/apiai";
import { AI } from "@itsmworkbench/ai";
import { Mailer } from "@itsmworkbench/mailer";
import { Sqler } from "@itsmworkbench/sql";
import { apiForFetchEmailer } from "@itsmworkbench/apifetchemail";
import { FetchEmailer } from "@itsmworkbench/fetchemail";
import { getUrls, listUrls, putUrls } from "@itsmworkbench/apiurlstore";
import { apiForSqlerPosts } from "@itsmworkbench/apisql";
import { apiForMailer } from "@itsmworkbench/apimailer";
import { chainOfResponsibility } from "@itsmworkbench/utils";


export const eventsPF: KoaPartialFunction = {
  isDefinedAt: ( ctx ) => ctx.stats?.isFile ()===true && ctx.context.request.method === 'GET',
  apply: async ( ctx ) => {
    const query = ctx.context.request.query
    const start = Number.parseInt ( query.start?.toString () || "0" )
    const result = await loadStringIncrementally ( fileLoading ( ctx.reqPathNoTrailing ) ) ( start )
    ctx.context.body = `${result.newStart}\n${result.result}`
  }
}

export const appendPostPF: KoaPartialFunction = {
  isDefinedAt: ( ctx ) => ctx.stats?.isFile () === true && ctx.context.request.method === 'POST',
  apply: async ( ctx ) => {
    const body: any = await (ctx.context.request as any).body // should be parsed according to content type
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