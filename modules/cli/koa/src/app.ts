// index.ts
import Koa from 'koa';
import http from 'http';

import { contextAndStats, ContextAndStats, defaultShowsError, directoryServesDefaultsIfExists, handleFile, KoaPartialFunction, notFoundIs404 } from "./koaPartialFunction";
import { chainOfResponsibility } from "@itsmworkbench/utils";
import { rawBodyParser } from "./raw.body.parser";

const cors = require ( '@koa/cors' );


export interface KoaAndServer {
  app: Koa
  server: http.Server
}

export const defaultHandler = ( ...handlers: KoaPartialFunction[] ): ( from: ContextAndStats, ) => Promise<void> =>
  chainOfResponsibility ( defaultShowsError, //called if no matches
    ...handlers,
    handleFile,
    directoryServesDefaultsIfExists,
    notFoundIs404,
  )
function readRawBody () {
  return async ( ctx, next ) => {
    // Promise to read the raw body
    const getRawBody = () => new Promise ( ( resolve, reject ) => {
      let data = '';
      ctx.req.on ( 'data', ( chunk ) => data += chunk );
      ctx.req.on ( 'end', () => resolve ( data ) );
      ctx.req.on ( 'error', ( err ) => reject ( err ) );
    } );

    // Assign the raw body to ctx.request.rawBody for later use
    ctx.request.rawBody = await getRawBody ();
    await next ();
  };
}

export function startKoa ( root: string, port: number, debug: boolean, handler?: ( c: ContextAndStats ) => Promise<void> ): Promise<KoaAndServer> {
  const app = new Koa ();
  app.use ( cors () );
  app.use ( rawBodyParser );
  const realHandler = handler || defaultHandler ();
  app.use ( async ctx => realHandler ( await contextAndStats ( ctx, root, debug ) ) )
  const server = http.createServer ( app.callback () );
  return new Promise<KoaAndServer> ( ( resolve, reject ) => {
    server.listen ( port, () => {
      console.log ( `Server started on http://localhost:${port} with root directory ${root}` )
      resolve ( { app, server } )
    } );
    return { app, server };
  } )
}

export function stopKoa ( { server }: KoaAndServer ) {
  server.close ();
}
