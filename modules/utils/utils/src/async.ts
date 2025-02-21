export async function mapAsync<T, T1>(ts: T[], fn: (t: T) => Promise<T1>): Promise<T1[]> {
    return Promise.all(ts.map(fn))
}