import {Headers, ServiceRequest} from "@itsmworkbench/service_caller"

export type Authentication = {
    name: string
    validate: () => string[]
    modifyUrl?: (url: string) => Promise<string>;
    modifyBody?: (body: any) => Promise<any>;
    modifyHeaders?: (headers: Headers) => Promise<Headers>;
}

export async function applyAuthentication<T>(auth: Authentication, req: ServiceRequest<T>): Promise<ServiceRequest<T>> {
    const {url, body, headers} = req
    return {
        ...req,
        url: auth.modifyUrl ? await auth.modifyUrl(url) : url,
        body: auth.modifyBody ? await auth.modifyBody(body) : body,
        headers: auth.modifyHeaders ? await auth.modifyHeaders(headers) : headers
    }
}

export const emptyAuthentication: Authentication = {
    name: 'empty',
    validate: () => []
}
export const testAuthentication: Authentication = {
    name: 'test',
    validate: () => [],
    modifyHeaders: async (headers: Headers) => ({...headers, 'x-test': 'test'}),
    modifyUrl: async (url: string) => `${url}?test=test`,
    modifyBody: async (body: any) => JSON.stringify({...JSON.parse(body), test: 'test'})
}

export const basicAuthentication = (username: string, password: string): Authentication => ({
    name: 'basic',
    validate: () => {
        const errors = [];
        if (!username) errors.push('Username must be provided for basic authentication');
        if (!password) errors.push('Password must be provided for basic authentication');
        return errors;
    },
    modifyHeaders: async (headers: Headers) => {
        const encoded = btoa(`${username}:${password}`);
        return {
            ...headers,
            Authorization: `Basic ${encoded}`
        };
    }
});


export const bearerAuthentication = (token: string): Authentication => ({
    name: 'bearer',
    validate: () => {
        const errors = [];
        if (!token) errors.push('Token must be provided for bearer authentication');
        return errors
    },
    modifyHeaders: async (headers: Headers) => {
        return ({...headers, Authorization: `Bearer ${token}`});
    }
})

export const bearerAuthenticationFromFn = (token: () => Promise<string>): Authentication => ({
    name: 'bearerFromFn',
    validate: () => {
        const errors = [];
        if (!token) errors.push('Token function must be provided for bearer authentication');
        return errors
    },
    modifyHeaders: async (headers: Headers) => {
        const bearer = await token();
        if (!bearer) throw new Error('Token function must return a token for bearer authentication');
        return ({...headers, Authorization: `Bearer ${bearer}`});
    }
})

