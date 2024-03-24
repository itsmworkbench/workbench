import { Operator } from "@itsmworkbench/operator";
import { ListNamesResult, NamedLoadResult, parseNamedUrlOrThrow, UrlStore } from "@itsmworkbench/urlstore";
import { ErrorsAnd } from "@laoban/utils";

export type InitialLoadDataResult = {
  operator?: ErrorsAnd<NamedLoadResult<Operator>>
  ticketList?: ErrorsAnd<ListNamesResult>
  kaList?: ErrorsAnd<ListNamesResult>
}
export async function loadInitialData ( urlStore: UrlStore ): Promise<InitialLoadDataResult> {
  const operator = await urlStore.loadNamed<Operator> ( parseNamedUrlOrThrow ( 'itsm/me/operator/me' ) )
  const ticketList = await urlStore.list ( { org: "me", namespace: "ticketevents", pageQuery: { page: 1, pageSize: 10 }, order: "date" } )
  const kaList = await urlStore.list ( { org: "me", namespace: "ka", pageQuery: { page: 1, pageSize: 1000 }, order: "date" } )
  return { operator, ticketList, kaList };
}
