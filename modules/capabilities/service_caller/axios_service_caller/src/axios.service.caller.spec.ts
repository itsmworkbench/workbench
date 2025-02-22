import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { axiosServiceCaller } from './axios.service.caller';
import {
    justValidator,
    ServiceRequest,
    ServiceResponse,
} from '@itsmworkbench/service_caller';
import { ErrorsOr } from '@itsmworkbench/errors';
import { createMockDebugLog } from '@itsmworkbench/utils';

// Create a mock adapter for axios
const mock = new MockAdapter(axios);
// Create a mock debug logger
const debugMock = createMockDebugLog();

describe('axiosServiceCaller - Successful Calls', () => {
    const serviceRequest: ServiceRequest = {
        method: 'GET',
        url: 'https://example.com/api',
        headers: { Authorization: 'Bearer token' },
    };

    afterEach(() => {
        mock.reset();
        jest.clearAllMocks();
    });

    it('returns a successful response with string body', async () => {
        const mockResponse = {
            status: 200,
            data: 'Success',
            headers: { 'x-correlation-id': '12345' },
        };

        mock
            .onGet(serviceRequest.url!)
            .reply(mockResponse.status, mockResponse.data, mockResponse.headers);

        const result: ErrorsOr<ServiceResponse<string>> = await axiosServiceCaller(
            serviceRequest,
            debugMock
        );

        expect(result).toEqual({
            value: {
                status: mockResponse.status,
                body: 'Success',
                headers: mockResponse.headers,
            },
        });
    });

    it('returns a successful response with parsed JSON', async () => {
        const jsonBody = { foo: 'bar' };
        const mockResponse = {
            status: 200,
            data: JSON.stringify(jsonBody),
            headers: { 'x-correlation-id': '12345' },
        };

        mock
            .onGet(serviceRequest.url!)
            .reply(mockResponse.status, mockResponse.data, mockResponse.headers);

        const result: ErrorsOr<ServiceResponse<{ foo: string }>> = await axiosServiceCaller(
            {
                ...serviceRequest,
                parser: justValidator<{ foo: string }>(),
            },
            debugMock
        );

        expect(result).toEqual({
            value: {
                status: mockResponse.status,
                body: jsonBody,
                headers: mockResponse.headers,
            },
        });
    });
});

describe('axiosServiceCaller - Error Handling', () => {
    const serviceRequest: ServiceRequest = {
        method: 'GET',
        url: 'https://example.com/api',
        headers: { some: 'header' },
    };

    afterEach(() => {
        mock.reset();
        jest.clearAllMocks();
    });

    it('handles 404 error responses', async () => {
        const mockErrorResponse = {
            status: 404,
            data: { error: 'Not Found' },
            headers: {},
        };

        mock
            .onGet(serviceRequest.url!)
            .reply(mockErrorResponse.status, mockErrorResponse.data, mockErrorResponse.headers);

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(
            serviceRequest,
            debugMock
        );

        expect(result).toEqual({
            errors: ['HTTP 404: undefined'],
            extras: { sr: serviceRequest, text: mockErrorResponse.data },
        });
    });

    it('handles network errors', async () => {
        mock.onGet(serviceRequest.url!).networkError();

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(
            serviceRequest,
            debugMock
        );

        expect(result).toEqual({
            errors: ['Network Error'],
            extras: { sr: serviceRequest },
        });
    });

    it('handles unexpected errors', async () => {
        const unexpectedError = new Error('Unexpected error');
        mock.onGet(serviceRequest.url!).reply(() => {
            throw unexpectedError;
        });

        const result: ErrorsOr<ServiceResponse> = await axiosServiceCaller(
            serviceRequest,
            debugMock
        );

        expect(result).toEqual({
            errors: [unexpectedError.message],
            extras: { sr: serviceRequest },
        });
    });
});
