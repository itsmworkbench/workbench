import { deepCombineTwoObjects, NameAnd } from "@laoban/utils";
import { RetryPolicyConfig, Throttling } from "@itsmworkbench/kleislis";
import { Authentication, isAuthentication } from "./authentication.domain";
import { simpleTemplate } from "@itsmworkbench/utils";

export type TargetDetails = NonFunctionals & Target
export interface FileTarget {
  file: string
  max: number
}
export function isFileTarget ( target: Target ): target is FileTarget {
  return (target as FileTarget).file !== undefined
}
export interface ElasticSearchTarget {
  max: number
  url: string
  auth: Authentication
}
export type Target = FileTarget | ElasticSearchTarget
export interface NonFunctionals {
  retry?: RetryPolicyConfig
  throttle?: Throttling
  concurrencyLimit?: number
}
export interface IndexDefaults {
  query?: NonFunctionals
  target?: TargetDetails
  auth?: Authentication
  scan?: NameAnd<any>
}

export interface IndexItem {
  type?: string
  index?: string //this is the name of the IndexItem
  query?: NonFunctionals
  target?: TargetDetails
  auth?: Authentication
  scan: NameAnd<any>
}

export type PopulatedIndexItem = Required<IndexItem>
export interface RawIndexConfig {
  defaults?: IndexDefaults
  index?: NameAnd<IndexItem>

}

export function validatePopulatedIndexItem ( name: string, p: PopulatedIndexItem ) {
  const msg = `in ${name}\n ${JSON.stringify ( p )}`
  if ( !p.index ) throw new Error ( 'index is required ' + msg )
  if ( !p.query ) throw new Error ( 'query is required ' + msg )
  if ( !p.auth ) throw new Error ( 'auth is required ' + msg )
  if ( !isAuthentication ( p.auth ) ) throw new Error ( 'auth is not valid ' + msg )
  if ( !p.scan ) throw new Error ( 'scan is required ' + msg )
  if ( !p.target ) throw new Error ( 'target is required ' + msg )
  if ( !p.type ) throw new Error ( 'type is required ' + msg )
}

export function cleanAndEnrichConfig ( config: RawIndexConfig, defaults: NameAnd<any> ): NameAnd<PopulatedIndexItem> { //will actually be more... i.e. github points to githubindexitem. BUT we can't specifiy that here
  const result: NameAnd<PopulatedIndexItem> = {}
  for ( const [ key, value ] of Object.entries ( config.index ) ) {
    const one = deepCombineTwoObjects ( { index: key, type: key }, config.defaults );
    const two = deepCombineTwoObjects ( one, defaults[ key ] );
    const three = deepCombineTwoObjects ( two, value );
    result[ key ] = three
  }
  for ( const [ key, thisItem ] of Object.entries ( result ) ) {
    if ( thisItem.query?.throttle ) thisItem.query.throttle = { current: thisItem.query.throttle.max || 0, ...thisItem.query.throttle }
    if ( thisItem.query?.concurrencyLimit === undefined ) thisItem.query.concurrencyLimit = 1000
    if ( thisItem.target?.throttle ) thisItem.target.throttle = { current: thisItem.target.throttle.max || 0, ...thisItem.target.throttle }
    if ( thisItem.target?.concurrencyLimit === undefined ) thisItem.target.concurrencyLimit = 20
    thisItem.scan.index = thisItem.scan?.index || key
    if ( isFileTarget ( thisItem.target ) )
      thisItem.scan.file = thisItem.target.file
    else throw new Error ( 'Only file targets are supported' )

    thisItem.scan.aclIndex = simpleTemplate ( thisItem.scan?.aclIndex, { source: key, index: thisItem.index } )
    const creds = (thisItem.auth as any)?.credentials
    if ( creds )
      for ( const [ k, v ] of Object.entries ( creds ) )
        if ( v?.toString ()?.includes ( '{' ) )
          creds[ k ] = simpleTemplate ( v?.toString (), { source: key, index: thisItem.index } )?.toUpperCase ()
  }
  return result
}

export function validateConfig ( config: NameAnd<PopulatedIndexItem> ): NameAnd<PopulatedIndexItem> {
  for ( const [ name, item ] of Object.entries ( config ) ) validatePopulatedIndexItem ( name, item )
  return config
}

