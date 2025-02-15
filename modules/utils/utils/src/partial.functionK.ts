export type PartialFunctionK<From, To> = (from: From) => Promise<To | undefined>

export function composePartialFunctionK<From, To>(...fns: PartialFunctionK<From, To>[]): PartialFunctionK<From, To> {
    return async (from: From) => {
        for (let fn of fns) {
            const result = await fn(from)
            if (result) {
                return result
            }
        }
        return undefined
    }
}
