export type PagingTc<Paging> = {
  zero: () => Paging
  hasMore: ( p: Paging ) => boolean
  logMsg: ( p: Paging ) => string
}