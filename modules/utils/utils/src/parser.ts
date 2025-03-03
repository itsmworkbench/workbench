export interface Parser<T> {
    parse: (context: string) => (s: string) => T
}

export interface Codec<From, To> {
    from: (t: To) => From
    to: (from: From) => To
}

export interface CodecK<From, To> {
    from: (t: To) => Promise<From>
    to: (from: From) => Promise<To>
}

