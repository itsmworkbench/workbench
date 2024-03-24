import { OrganisationUrlStoreConfigForGit, UrlStore } from "@itsmworkbench/urlstore";
import { listInStoreFn } from "./node.urlstore.list";
import { loadFromIdentityUrl, loadFromNamedUrl } from "./node.urlstore.load";
import { GitOps } from "@itsmworkbench/git";
import { saveNamedUrl } from "./node.urlstore.save";

export function nodeUrlstore ( gitOps: GitOps, config: OrganisationUrlStoreConfigForGit ): UrlStore {
  return {
    list: listInStoreFn ( config ),
    loadIdentity: loadFromIdentityUrl ( gitOps, config ),
    loadNamed: loadFromNamedUrl ( gitOps, config ),
    save: saveNamedUrl ( gitOps, config )
  }
}