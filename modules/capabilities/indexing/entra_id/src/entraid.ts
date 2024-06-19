import { fetchArrayWithPaging, FetchFn, FetchFnResponse, fetchOneItem, IndexParentChildLogAndMetrics, PagingTc } from "@itsmworkbench/indexing";
import { NameAnd } from "@laoban/utils";


export type EntraPaging = {
  next?: string
}
export const entraIdPaging: PagingTc<EntraPaging> = {
  zero: () => ({ next: undefined }),
  hasMore: ( page ) => !!page.next,
  logMsg: ( page ) => `Next: ${page.next}`,
  url: ( baseUrl, p ) => p.next ?? baseUrl,
  fromResponse: ( data, linkHeader ) => ({ data, next: data[ '@odata.nextLink' ] })
}
async function* mapAsyncGenerator<T, R> ( iterable: AsyncIterable<T>, mapFn: ( item: T ) => Promise<R> | R ): AsyncGenerator<R, void, unknown> {
  for await ( const item of iterable ) {
    yield await mapFn ( item );
  }
}

export async function values ( res: any ): Promise<any[]> {
  return res.value;
}

export type EntraIdMember ={
  id: string
  mail: string
}
export type EntraIdGroup = {
  id: string
  displayName: string
}
export type EntraIdGroupAndMember = {
  group: EntraIdGroup
  member: EntraIdMember

}
export async function* allMembers ( fetchFn: FetchFn, headers: NameAnd<string>, log: IndexParentChildLogAndMetrics, filter: string, ): AsyncGenerator<EntraIdGroupAndMember, void> {
  const fArray = fetchArrayWithPaging ( fetchFn, log, entraIdPaging );
  const fOne = fetchOneItem ( fetchFn );
  for await ( const group of fArray<EntraIdGroup> ( `https://graph.microsoft.com/v1.0/groups?$filter=${encodeURIComponent ( filter )}`, { headers }, values ) ) {
    const groupId = group.id
    for await ( const member of fArray<any> ( `https://graph.microsoft.com/v1.0/groups/${groupId}/members`, { headers }, values ) ) {
      yield {group, member};
    }
  }
}

export async function* allMembersOfGroup ( fetchFn: FetchFn, headers: NameAnd<string>, log: IndexParentChildLogAndMetrics, groupName: string ): AsyncGenerator<EntraIdMember, void> {
  for await ( const member of allMembers ( fetchFn, headers, log, `displayName eq '${groupName}'` ) ) {
    yield member.member;
  }
}