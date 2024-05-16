import { AccessConfig } from "./access";

export type PagingTc<Paging> = {
  zero: () => Paging
  hasMore: ( p: Paging ) => boolean
  logMsg: ( p: Paging ) => string
}


export type NoPaging = {}

export const NoPagingTc: PagingTc<NoPaging> = {
  zero: () => ({}),
  hasMore: ( page ) => false,
  logMsg: ( page ) => ``
}

export const noPagingAccessConfig: AccessConfig<NoPaging> = {
  pagingFn: ( json, linkHeader ) => ({})
}
