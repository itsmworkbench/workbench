import { NameSpaceDetailsForGit, OrganisationUrlStoreConfigForGit, UrlStore } from "@itsmworkbench/url";
import { listInStoreFn } from "./node.urlstore.list";
import { loadFromUrlStore } from "./node.urlstore.load";
import { GitOps } from "@itsmworkbench/git";
import { saveNamedUrl } from "./node.urlstore.save";

export function nodeUrlstore ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlStore {
  return {
    list: listInStoreFn ( config ),
    load: loadFromUrlStore ( gitOps, config ),
    save: saveNamedUrl ( gitOps, config )
  }
}