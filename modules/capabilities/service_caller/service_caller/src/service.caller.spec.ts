import {stringParserAndValidator, Headers, makeServiceResponse, ServiceResponse} from './service.caller';
import {ErrorsOr, errorsOrThrow} from "@itsmworkbench/errors"

// ---- Mock Data ----
const mockHeaders: Headers = {'content-type': 'application/json'};

// ---- Test Cases ----
describe('makeResponse - Without Parser', () => {
    it('returns string response when parser is undefined', () => {
        const result: ErrorsOr<ServiceResponse<string>> = makeServiceResponse(200, mockHeaders, 'Simple text response');

        expect(result).toEqual({
            value: {body: 'Simple text response', headers: mockHeaders, status: 200}
        });
    });

    it('returns undefined body for 404 status', () => {
        const result: ErrorsOr<ServiceResponse<null>> = makeServiceResponse(404, mockHeaders, undefined);

        expect(result).toEqual({
            value: {body: undefined, headers: mockHeaders, status: 404}
        });
    });

    it('returns errors for unexpected status codes', () => {
        const result: ErrorsOr<ServiceResponse<string>> = makeServiceResponse(500, mockHeaders, 'Internal server error');

        expect(result).toEqual({
            "errors": ["Unexpected status code: 500"],
            "extras": {"body": "Internal server error", "status": 500}
        });
    });
});

describe('makeResponse - With Parser', () => {
    it('returns parsed JSON when parser is provided', () => {
        const jsonBody = '{"foo": "bar"}';
        const result: ErrorsOr<ServiceResponse<{ foo: string }>> = makeServiceResponse(200, mockHeaders, jsonBody, stringParserAndValidator<{ foo: string }>());

        expect(result).toEqual({
            value: {body: {foo: 'bar'}, headers: mockHeaders, status: 200}
        });
    });

    it('returns validation errors from parser', () => {
        const jsonBody = '{"foo": 42}'; // Invalid because foo should be a string
        const validator = (t: any) => typeof t.foo === 'string' ? [] : ['Invalid foo type'];
        const result: ErrorsOr<ServiceResponse<{ foo: string }>> = makeServiceResponse(200, mockHeaders, jsonBody, stringParserAndValidator<{ foo: string }>(validator));

        expect(result).toEqual({
            "errors": [
                "Invalid foo type"
            ],
            "extras": {
                "body": "{\"foo\": 42}",
                "headers": {"content-type": "application/json"},
                "status": 200
            }
        });
    });

    it('handles invalid JSON with parsing error', () => {
        const invalidJson = '{foo: bar}'; // Invalid JSON format
        const result: ErrorsOr<ServiceResponse<{ foo: string }>> = makeServiceResponse(200, mockHeaders, invalidJson, stringParserAndValidator<{ foo: string }>());
        const resultErrors = errorsOrThrow(result);
        expect(resultErrors).toEqual({
            "errors": [
                "Expected property name or '}' in JSON at position 1"
            ],
            "extras": {
                "s": "{foo: bar}",
                "status": 200
            }
        });
    });
});
