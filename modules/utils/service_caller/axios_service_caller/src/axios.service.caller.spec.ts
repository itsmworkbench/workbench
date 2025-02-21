import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import {AxiosContext, axiosServiceCaller} from './axios.service.caller';
import {justValidator, ServiceRequest, ServiceResponse} from '@itsmworkbench/service_caller';
import {ErrorsOr} from '@itsmworkbench/errors';
import {createMockDebugLog} from '@itsmworkbench/utils';
import {emptyAuthentication, testAuthentication} from '@itsmworkbench/login';

const mock = new MockAdapter(axios);
const debugMock = createMockDebugLog();
const axiosContext: AxiosContext = {
    authentication: emptyAuthentication,
    debug: debugMock,
    axiosConfig: {}
};

describe('axiosServiceCaller - Successful Calls', () => {
    const serviceRequest: ServiceRequest = {
        method: 'GET',
        url: 'https://example.com/api',
        headers: {Authorization: 'Bearer token'}
    };

    afterEach(() => {
        mock.reset();
        jest.clearAllMocks();
    });

    it('returns a successful response with string body', async () => {
        const mockResponse = {
            status: 200,
            data: 'Success',
            headers: {'x-correlation-id': '12345'}
        };
        mock.onGet(serviceRequest.url).reply(
            mockResponse.status,
            mockResponse.data,
            mockResponse.headers
        );

        const result: ErrorsOr<ServiceResponse<string>> = await axiosServiceCaller(axiosContext, serviceRequest);

        expect(result).toEqual({
            value: {
                status: mockResponse.status,
                body: 'Success',
                headers: mockResponse.headers
            }
        });
    });

    it('returns a successful response with parsed JSON', async () => {
        const jsonBody = {foo: 'bar'};
        const mockResponse = {
            status: 200,
            data: JSON.stringify(jsonBody),
            headers: {'x-correlation-id': '12345'}
        };
        mock.onGet(serviceRequest.url).reply(
            mockResponse.status,
            mockResponse.data,
            mockResponse.headers
        );

        const result: ErrorsOr<ServiceResponse<{ foo: string }>> = await axiosServiceCaller(
            axiosContext,
            {...serviceRequest, parser: justValidator<{ foo: string }>()}
        );

        expect(result).toEqual({
            value: {
                status: mockResponse.status,
                body: jsonBody,
                headers: mockResponse.headers
            }
        });
    });
});

describe('axiosServiceCaller - Error Handling', () => {
    const serviceRequest: ServiceRequest = {
        method: 'GET',
        headers: {some: 'header'},
        url: 'https://example.com/api'
    };

    afterEach(() => {
        mock.reset();
        jest.clearAllMocks();
    });

    it('handles 404 error responses', async () => {
        const mockErrorResponse = {
            status: 404,
            data: {error: 'Not Found'},
            headers: {}
        };
        mock.onGet(serviceRequest.url).reply(
            mockErrorResponse.status,
            mockErrorResponse.data,
            mockErrorResponse.headers
        );

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(axiosContext, serviceRequest);

        expect(result).toEqual({
            errors: ['HTTP 404: undefined'],
            extras: {sr: serviceRequest, text: mockErrorResponse.data}
        });
    });

    it('handles network errors', async () => {
        mock.onGet(serviceRequest.url).networkError();

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(axiosContext, serviceRequest);

        expect(result).toEqual({
            errors: ["Network Error"],
            extras: {sr: serviceRequest}
        });
    });

    it('handles unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');
        mock.onGet(serviceRequest.url).reply(() => {
            throw unexpectedError;
        });

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(axiosContext, serviceRequest);

        expect(result).toEqual({
            errors: [unexpectedError.message],
            extras: {sr: serviceRequest}
        });
    });

    it('applies authentication to PUT request with JSON body', async () => {
        const axiosContextWithAuth: AxiosContext = {
            ...axiosContext,
            authentication: testAuthentication,
        };

        const someJson = {key: 'value', anotherKey: 123};
        const requestBody = JSON.stringify(someJson);  // JSON string body

        const mockResponse = {
            status: 200,
            data: {message: 'Success'},
            headers: {'x-correlation-id': '12345'}
        };

        // Mocking PUT request with test authentication modifying the URL
        mock.onPut('https://example.com/api?test=test').reply(
            mockResponse.status,
            mockResponse.data,
            mockResponse.headers
        );

        // Prepare PUT request
        const serviceRequest: ServiceRequest = {
            method: 'PUT',
            url: 'https://example.com/api',
            body: requestBody,
            headers: {}
        };

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(axiosContextWithAuth, serviceRequest);

        // Validate response
        expect(result).toEqual({
            value: {
                status: mockResponse.status,
                body: mockResponse.data,
                headers: mockResponse.headers
            }
        });

        // Validate request details
        const requestHistory = mock.history.put[0];
        expect(requestHistory.url).toBe('https://example.com/api?test=test');
        expect(requestHistory.headers['x-test']).toBe('test');
        expect(requestHistory.data).toBe('{"key":"value","anotherKey":123,"test":"test"}');  // Ensure the body was sent correctly
    });

});
