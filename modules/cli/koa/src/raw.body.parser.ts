import { Context, Next } from 'koa';

export type KoaMiddleware = ( ctx: Context, next: Next ) => Promise<void>;
export const rawBodyParser: KoaMiddleware = async ( ctx: Context, next: Next ): Promise<void> => {
  // Promise to read the raw body
  const getRawBody = () => new Promise ( ( resolve, reject ) => {
    let data = '';
    ctx.req.on ( 'data', ( chunk ) => data += chunk );
    ctx.req.on ( 'end', () => resolve ( data ) );
    ctx.req.on ( 'error', ( err ) => reject ( err ) );
  } );

  // Assign the raw body to ctx.request.rawBody for later use
  (ctx.request as any).rawBody = await getRawBody ();
  await next ();
};