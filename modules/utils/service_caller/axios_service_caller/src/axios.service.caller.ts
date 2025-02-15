import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {Errors, ErrorsOr} from "@itsmworkbench/errors";
import {makeServiceResponse, ServiceRequest, ServiceResponse} from "@itsmworkbench/service_caller";
import {applyAuthentication, Authentication} from "@itsmworkbench/authentication";
import {DebugLog, NameAnd} from '@itsmworkbench/utils';

export type AxiosContext = {
    debug: DebugLog,
    axiosConfig: AxiosRequestConfig;
    authentication: Authentication
}

export async function axiosServiceCaller<T>(
    {axiosConfig, debug, authentication}: AxiosContext,
    req: ServiceRequest<T>,
): Promise<ErrorsOr<ServiceResponse<T>>> {
    try {
        debug('serviceCaller - req', req);
        const withAuth = await applyAuthentication(authentication, req)
        const axiosReq = {
            ...req,
            method: withAuth.method,
            url: withAuth.url,
            data: withAuth.body,
            headers: withAuth.headers || {},
        };
        const response = await axios(axiosReq);
        const responseHeaders: NameAnd<string> = {}
        for (const [key, value] of Object.entries(response?.headers || {}))
            responseHeaders[key] = Array.isArray(value) ? value.join(',') : value.toString()
        const result = makeServiceResponse<T>(response.status, responseHeaders, response.data, req.parser);
        debug('serviceCaller - res', result);
        return result
    } catch (error: any) {
        const result: Errors = handleAxiosError(req, error);
        debug.debugError(error, 'serviceCaller - error', result);
        return result;
    }
}

function handleAxiosError<T>(sr: ServiceRequest<T>, error: AxiosError): Errors {
    if (error.response) {
        // Server responded with a status other than 2xx
        return {
            errors: [`HTTP ${error.response.status}: ${error.response.statusText}`],
            extras: {sr, 'text': error.response.data},
            reference: error.response.headers['x-correlation-id'] || undefined
        };
    } else if (error.request) {
        // Request was made but no response received
        return {
            errors: ['No response received from server'],
            extras: {sr, request: error.request}
        };
    } else {
        // Something happened in setting up the request
        return {
            errors: [error.message],
            extras: {sr}
        };
    }
}
