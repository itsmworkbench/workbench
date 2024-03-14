import { ListIds } from "@itsmworkbench/listids";
import { KnowledgeArticle, KnowledgeArticles } from "@itsmworkbench/knowledge_articles";
import { SoftwareCatalog, SoftwareCatalogs } from "@itsmworkbench/softwarecatalog";
import { Template, Templates } from "@itsmworkbench/templates";
import { IdAndName, SelectedAndList } from "@itsmworkbench/utils";
import { Operator } from "@itsmworkbench/operator";
import { ListNamesResult, NamedLoadResult, parseNamedUrlOrThrow, UrlStore } from "@itsmworkbench/url";
import { ErrorsAnd } from "@laoban/utils";

export type InitialLoadDataResult = {
  operator?: ErrorsAnd<NamedLoadResult<Operator>>
  ticketList?: ErrorsAnd<ListNamesResult>
  kaList?: ErrorsAnd<ListNamesResult>
}
export async function loadInitialData ( urlStore: UrlStore ): Promise<InitialLoadDataResult> {
  const operator = await urlStore.loadNamed<Operator> ( parseNamedUrlOrThrow ( 'itsm/me/operator/me' ) )
  const ticketList = await urlStore.list ( "me", "ticketevents", { page: 1, pageSize: 10 }, "date" )
  const kaList = await urlStore.list ( "me", "ks", { page: 1, pageSize: 1000 }, "date" )
  return { operator, ticketList, kaList };
}
