import { ListIds } from "@itsmworkbench/listids";
import { KnowledgeArticle, KnowledgeArticles } from "@itsmworkbench/knowledge_articles";
import { SoftwareCatalog, SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";
import { Template, Templates } from "@itsmworkbench/templates";
import { IdAndName, SelectedAndList } from "@itsmworkbench/utils";
import { Operator } from "@itsmworkbench/operator";
import { UrlLoadFn, UrlLoadResult } from "@itsmworkbench/url";
import { ErrorsAnd } from "@laoban/utils";

export type InitialLoadDataResult = {
  operator?: ErrorsAnd<UrlLoadResult<Operator>>
}
export async function loadInitialData ( urlLoader: UrlLoadFn ): Promise<InitialLoadDataResult> {
  const operator = await urlLoader<Operator> ( 'itsm:me:operator:me' )
  return { operator };
}
export type InitialLoadIdResult = {
  kas: KnowledgeArticles
  scs: SoftwareCatalogs
  templates: Templates
}

export async function loadInitialIds ( listIds: ListIds ): Promise<InitialLoadIdResult> {

  const kaIds = await listIds ( 'ka' )
  console.log ( 'kaIds', kaIds )
  const scIds = await listIds ( 'sc' )
  console.log ( 'scIds', scIds )
  const templateIds = await listIds ( 'template' )
  console.log ( 'template', templateIds )
  function make<T extends SelectedAndList<T1>, T1 extends IdAndName> ( ids: string[], fn: ( s: SelectedAndList<T1> ) => T ): T {
    return fn ( { options: ids.map ( k => ({ id: k, name: k }) ) } )
  }
  return {
    kas: make<KnowledgeArticles, KnowledgeArticle> ( kaIds, s => s ),
    scs: make<SoftwareCatalogs, SoftwareCatalog> ( scIds, s => s ),
    templates: make<Templates, Template> ( templateIds, s => s )
  }
}
