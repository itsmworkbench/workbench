import { ISideEffectProcessor, ResultsAndTransforms, SideEffect } from "@itsmworkbench/react_core";
import { NamedLoadResult, NamedUrl, UrlLoadNamedFn } from "@itsmworkbench/urlstore";
import { Optional, Transform } from "@focuson/lens";
import { KnowledgeArticle } from "@itsmworkbench/knowledgearticle";
import { ErrorsAnd, hasErrors } from "@laoban/utils";


export interface LoadKaSideEffect extends SideEffect {
  command: 'loadKa';
  ka: NamedUrl
}

export function addLoadKaSideEffect<S> ( urlLoadFn: UrlLoadNamedFn, targetL: Optional<S, KnowledgeArticle> ): ISideEffectProcessor<S, LoadKaSideEffect, KnowledgeArticle> {
  return ({
    accept: ( s: SideEffect ): s is LoadKaSideEffect => s.command === 'loadKa',
    process: async ( s: S, ke: LoadKaSideEffect ) => {
      console.log ( 'addLoadKaSideEffect - ke', ke )
      const kaUrl: NamedUrl = ke.ka

      const res: ErrorsAnd<NamedLoadResult<KnowledgeArticle>> = await urlLoadFn ( kaUrl )
      if ( hasErrors ( res ) ) return { result: res }
      const txs: Transform<S, any>[] = [
        [ targetL, _ => res ],
      ]
      let result: ResultsAndTransforms<S, KnowledgeArticle> = { result: res.result, txs };
      return result
    }
  })
}

