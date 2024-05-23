export interface RawConfig {
  port?: number
  host?: string
  something?: string
}

export type Config = Required<RawConfig>

export type ConfigWithoutHist = Omit<Config, 'host'>
export type UrlConfig = Pick<Config, 'port' | 'host'>

function isConfig ( c: any ): c is Config {
  return c.port != undefined
}

export type Color = {
  some: string
  other: string
}
export function isColor ( c: AorB ): c is Color {
  return typeof c === 'object'
}
export type AorB = 'red' | 'green' | 'blue' | Color

const x: AorB = 'red'

if ( isColor(x)  ) {
  x.some
}
x.some

export function get<M, K extends keyof M> ( m: M, k: K ): M[K] {
  return m[ k ]
}

const c1: Config = {} as any
const x1: number = get ( c1, 'port' )