import { ListIds } from "@itsmworkbench/listids";
import { parseUsingStore } from "@itsmworkbench/parser";
import { IdStore } from "@itsmworkbench/idstore";
import { ApiIdStore } from "./idstore.loading";

export function listidsFromFetch ( apiIdStore: ApiIdStore ): ListIds {
  return async ( idType ) => {
    let response = await fetch ( apiIdStore.url + "/ids/" + idType );
    if ( response.status < 400 ) {
      return await response.json ();
    } else {
      const result = await response.text ();
      console.error ( `Error loading ${apiIdStore.url} ${response.status}\n${result}` )
      return []
    }
  }
}