import { AccessConfig } from "./access";
import { NoPaging } from "@itsmworkbench/kleislis";

export const noPagingAccessConfig: AccessConfig<NoPaging> = {
  pagingFn: ( json, linkHeader ) => ({})
}
