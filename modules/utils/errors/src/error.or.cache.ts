import { ErrorsOr } from "@itsmworkbench/errors";

export type TimeService = () => number;
export const DateTimeService: TimeService = () => Date.now();

export type ErrorsOrKleisli<Req, Res> = (req: Req) => Promise<ErrorsOr<Res>>;

export type CacheItem<Res> = {
    promise: Promise<ErrorsOr<Res>>;
    timestamp: number;
};

export type CacheConfig<Req, Res> = {
    reqToString: (req: Req) => string;
    cache: Map<string, CacheItem<Res>>;
    ttl: number;
    timeservice: TimeService;
    cacheErrors?: boolean;
};

export function cacheErrorsOrKleisli<Req, Res>(
    fn: ErrorsOrKleisli<Req, Res>,
    config?: Partial<CacheConfig<Req, Res>>
): ErrorsOrKleisli<Req, Res> {
    const {
        reqToString = JSON.stringify,
        cache = new Map<string, CacheItem<Res>>(),
        ttl = 60000,
        timeservice = DateTimeService,
        cacheErrors = true,
    } = config || {};

    return async (req: Req): Promise<ErrorsOr<Res>> => {
        const key = reqToString(req);
        const now = timeservice();
        const cachedItem = cache.get(key);
        if (cachedItem && now - cachedItem.timestamp < ttl) {
            // If we find a valid cache entry, return it directly.
            return cachedItem.promise;
        }

        // If there is no cache entry, or it has expired, call the original function.
        const promise = fn(req).then((result) => {
            if (result instanceof Error && !cacheErrors) {
                // If the result is an error, and we don't want to cache errors, remove the entry from the cache.
                cache.delete(key);
            }
            return result;
        });

        // Store the promise and the current timestamp in the cache.
        cache.set(key, { promise, timestamp: now });
        return promise;
    };
}
