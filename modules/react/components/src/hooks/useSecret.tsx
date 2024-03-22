import { ErrorsAnd } from "@laoban/utils";


export type SecretFn = ( encrypted: string ) => Promise<ErrorsAnd<string>>
/** provides easy access to secrets hiding how they are done
 * For MVP just using base64. Longer term strong encryption
 *
 * This is a promise because it may need information to do the decrypting
 * */
export function useSecret (): SecretFn {
  return async s => {
    try {
      return atob ( s )
    } catch ( e ) {
      return [ e.message ]
    }
  }
}
