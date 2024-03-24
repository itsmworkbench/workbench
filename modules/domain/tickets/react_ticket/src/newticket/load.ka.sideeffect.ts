import { ISideEffectProcessor, ResultsAndTransforms, SideEffect } from "@itsmworkbench/react_core";
import { NamedLoadResult, NamedUrl, UrlLoadNamedFn } from "@itsmworkbench/urlstore";
import { Optional, Transform } from "@focuson/lens";
import { TicketType } from "@itsmworkbench/tickettype";
import { ErrorsAnd, hasErrors } from "@laoban/utils";


export interface LoadKaSideEffect extends SideEffect {
  command: 'loadKa';
  ka: NamedUrl
}

export function addLoadKaSideEffect<S> ( urlLoadFn: UrlLoadNamedFn, targetL: Optional<S, TicketType> ): ISideEffectProcessor<S, LoadKaSideEffect, TicketType> {
  return ({
    accept: ( s: SideEffect ): s is LoadKaSideEffect => s.command === 'loadKa',
    process: async ( s: S, ke: LoadKaSideEffect ) => {
      console.log ( 'addLoadKaSideEffect - ke', ke )
      const kaUrl: NamedUrl = ke.ka

      const res: ErrorsAnd<NamedLoadResult<TicketType>> = await urlLoadFn ( kaUrl )
      if ( hasErrors ( res ) ) return { result: res }
      const txs: Transform<S, any>[] = [
        [ targetL, _ => res ],
      ]
      let result: ResultsAndTransforms<S, TicketType> = { result: res.result, txs };
      return result
    }
  })
}

