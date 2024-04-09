import { evaluateAllDependentItems, EvaluateDiFn } from "./dependant.evaluation";
import { doActions, DoActionsFn, RequestEngine } from "./dependant.execute";
import { TagStoreGetter } from "./tag.store";

export interface DependentEngine<S> {
  //Produces a list of 'actions' which detail 'what needs doing right now' and 'what needs to be fetched'
  evaluate: EvaluateDiFn<S>
  doActions: DoActionsFn<S>
}

export function dependentEngine<S> ( engine: RequestEngine<S>, tagGetter: TagStoreGetter<S> ): DependentEngine<S> {
  return {
    evaluate: evaluateAllDependentItems ( tagGetter ),
    doActions: doActions ( engine, tagGetter )
  }
}