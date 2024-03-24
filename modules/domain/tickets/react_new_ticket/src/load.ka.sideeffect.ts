import { ISideEffectProcessor, ResultsAndTransforms, SideEffect } from "@itsmworkbench/react_core";
import { ErrorsAnd, hasErrors, mapErrorsK } from "@laoban/utils";
import { NamedLoadResult, NamedUrl, UrlLoadNamedFn, writeUrl } from "@itsmworkbench/urlstore";
import { Optional, Transform } from "@focuson/lens";
import { SetIdEvent, SetValueEvent } from "@itsmworkbench/events";
import { defaultTicketTypeDetails, detailsToTicketType, TicketType } from "@itsmworkbench/tickettype";


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

