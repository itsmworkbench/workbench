import { KoaPartialFunction } from "@itsmworkbench/koa";
import { AIEmailsFn, AIKnownTicketVariablesFn, AiTicketVariablesFn } from "@itsmworkbench/ai";

export const executeAIForVariables = ( ai: AiTicketVariablesFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/ai\/variables/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    return !!result ;
  },
  apply: async ( ctx ) => {
    let ticket = ctx.context.request.rawBody;
    console.log ( 'AI: ticket', ticket )
    try {
      const result = await ai ( ticket );
      console.log ( 'AI: result', result )
      ctx.context.body = result;
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e:any ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})

export const executeAIForKnownVariables = ( ai: AIKnownTicketVariablesFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/ai\/knownvariables/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    console.log('AI: isDefinedAt', ctx.context.request.path,result, isMethodMatch, match)
    return !!result;
  },
  apply: async ( ctx ) => {
    const {ticket, attributes} = JSON.parse(ctx.context.request.rawBody)
    console.log ( 'AI: known ticket', ticket, attributes)
    try {
      const result = await ai ( ticket, attributes );
      console.log ( 'AI: result', result )
      ctx.context.body = result;
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e: any ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})

export const executeAIForEmail = ( ai: AIEmailsFn ): KoaPartialFunction => ({
  isDefinedAt: ( ctx ) => {
    const match = /^\/ai\/email/.exec ( ctx.context.request.path );
    const isMethodMatch = ctx.context.request.method === 'POST';
    let result = match && isMethodMatch;
    // console.log ( 'AI: isDefinedAt', ctx.context.request.path, result, isMethodMatch, match )
    return !!result ;
  },
  apply: async ( ctx ) => {
    let ticket = ctx.context.request.rawBody;
    console.log ( 'AI: ticket', ticket )
    try {
      const result = await ai ( JSON.parse(ticket) );
      console.log ( 'AI: result', result )
      ctx.context.body = JSON.stringify(result);
      ctx.context.set ( 'Content-Type', 'application/json' );
    } catch ( e:any ) {
      ctx.context.status = 500;
      ctx.context.body = e.toString ();
    }
  }
})