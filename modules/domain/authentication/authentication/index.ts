import {AuthenticationPlugins} from "./src/authentication/authentication";
import {apiKeyAuthenticationPlugin} from "./src/authentication/apiKeyAuthentication";
import {basicAuthenticationPlugin} from "./src/authentication/basicAuthentication";
import {bearerAuthenticationPlugin} from "./src/authentication/bearerAuthentication";
import {noAuthenticationPlugin} from "./src/authentication/noAuthentication";
import {privateTokenAuthenticationPlugin} from "./src/authentication/privateTokenAuthentication";
import {sasAuthenticationPlugin} from "./src/authentication/SASAuthentication";

export * from './src/crypto/secret.data'
export * from './src/authentication/authentication'
export * from './src/authentication/apiKeyAuthentication'
export * from './src/authentication/basicAuthentication'
export * from './src/authentication/bearerAuthentication'
export * from './src/authentication/noAuthentication'
export * from './src/authentication/privateTokenAuthentication'
export * from './src/authentication/SASAuthentication'
export * from './src/credentials'

export const allAuthentication: AuthenticationPlugins = {
    apiKey: apiKeyAuthenticationPlugin,
    basic: basicAuthenticationPlugin,
    bearer: bearerAuthenticationPlugin,
    no: noAuthenticationPlugin,
    privateToken: privateTokenAuthenticationPlugin,
    sas: sasAuthenticationPlugin
}