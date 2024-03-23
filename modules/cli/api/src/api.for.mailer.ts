import { AiTicketVariablesFn } from "@itsmworkbench/ai_ticketvariables";
import { KoaPartialFunction } from "@itsmworkbench/koa";
import { Mailer } from "@itsmworkbench/mailer";

export const apiForMailer = ( mailer: Mailer ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/api\/email/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    return result;
  },
  apply: async ( ctx ) => {
    const test = ctx.context.request.path.endsWith ( '/test' )
    let email = JSON.parse ( ctx.context.request.rawBody );
    console.log ( 'Email', email )
    try {
      const result = await (test ? mailer.test () : mailer.sendEmail ( email ));
      console.log ( 'Email: result', result )
      ctx.context.body = JSON.stringify ( result, null, 2 );
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})