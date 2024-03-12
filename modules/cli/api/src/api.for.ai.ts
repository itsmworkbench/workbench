import { KoaPartialFunction } from "@itsmworkbench/koa";
import { AiTicketVariablesFn } from "@itsmworkbench/ai_ticketvariables";

export const executeAIForVariables = ( ai: AiTicketVariablesFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/ai\/variables/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    console.log('AI: isDefinedAt', ctx.context.request.path,result, isMethodMatch, match)
    return result;
  },
  apply: async ( ctx ) => {
    let ticket = ctx.context.request.rawBody;
    console.log ( 'AI: ticket', ticket )
    try {
      const result = await ai ( ticket );
      console.log ( 'AI: result', result )
      ctx.context.body = result;
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})
export const executeAIForChat = ( ai: AiTicketVariablesFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/ai\/chat/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    console.log('AI: isDefinedAt', ctx.context.request.path,result, isMethodMatch, match)
    return result;
  },
  apply: async ( ctx ) => {
    let ticket = ctx.context.request.rawBody;
    console.log ( 'AI: ticket', ticket )
    try {
      const result = await ai ( ticket );
      console.log ( 'AI: result', result )
      ctx.context.body = result;
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})