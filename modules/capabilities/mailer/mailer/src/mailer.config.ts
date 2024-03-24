import { mapErrors } from "@laoban/utils";
import { NamedUrl, UrlStore } from "@itsmworkbench/urlstore";


export async function emailConfigFromUrlStore ( urlStore: UrlStore, organisation: string, name: string ) {
  const namedUrl: NamedUrl = { scheme: "itsm", organisation, namespace: "operator", name }
  console.log ( 'emailConfigFromUrlStore-namedUrl', namedUrl )
  return mapErrors ( await urlStore.loadNamed ( namedUrl ), res => {
    console.log ( 'emailConfigFromUrlStore-res', res )
    return res.result
  } )
}