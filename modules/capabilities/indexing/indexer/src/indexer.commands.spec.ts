import { NameAnd } from "@laoban/utils";
import { apiKeyDetails, ApiKeyDetails } from "./apikey.for.dls";
import { makeApiKeyDetailsFromFile, parseApiKeyDetailsFromFile } from "./indexer.commands";
import { jsYaml } from "@itsmworkbench/jsyaml";

const env: NameAnd<string> = {
  'ELASTIC_SEARCH_PASSWORD': 'somePassword'
};
const prototype: ApiKeyDetails = apiKeyDetails ( { index: [ 'i1', 'i2' ], uncontrolled: [ 'u1', 'u2' ] }, env )
describe ( 'indexer.commands', () => {
  describe ( 'makeApiKeyDetailsFromFile', () => {

    it ( 'should correctly process a valid YAML file', async () => {
      const file = 'apikeyapi.yaml';
      const result = await makeApiKeyDetailsFromFile ( jsYaml (), prototype, file, env );
      expect ( result ).toEqual ( {
        "dev": {
          "deletePrevious": false,
          "elasticSearchUrl": "https://c3224bc073f74e73b4d7cec2bb0d5b5e.westeurope.azure.elastic-cloud.com:9243/",
          "headers": { "Authorization": "Basic SW5kZXhlcl9OUEE6c29tZVBhc3N3b3Jk" },
          "index": [ "i1", "i2" ],
          "uncontrolled": [ "u1", "u2" ],
          "username": "Indexer_NPA"
        },
        "prod": {
          "deletePrevious": false,
          "elasticSearchUrl": "https://f0571c62200b4d249a4c6750ab7f4716.westeurope.azure.elastic-cloud.com:9243/",
          "headers": { "Authorization": "Basic SW5kZXhlcl9OUEE6c29tZVBhc3N3b3Jk" },
          "index": [ "i1", "i2" ],
          "uncontrolled": [ "u1", "u2" ],
          "username": "Indexer_NPA"
        }
      } )
    } );
  } );

  describe ( 'parseApiKeyDetailsFromFile - Unhappy Paths', () => {
    it ( 'should throw an error if the JSON has errors', () => {
      const fileAsJson = [ { message: 'YAML parsing error' } ];
      const file = 'invalid_apikeyapi.yaml';

      expect ( () => {
        parseApiKeyDetailsFromFile ( fileAsJson, file, prototype, env );
      } ).toThrow ( `Error in file ${file} ${fileAsJson}` );
    } );

    it ( 'should throw an error if a value is not an object', () => {
      const fileAsJson = { someKey: "this is a string, not an object" };
      const file = 'non_object_value.yaml';

      expect ( () => {
        parseApiKeyDetailsFromFile ( fileAsJson, file, prototype, env );
      } ).toThrow ( `Value for someKey in ${file} is not an object` );
    } );

    it ( 'should throw an error if an entry is missing the url', () => {
      const fileAsJson = { someKey: { username: "user", password: "pass" } };
      const file = 'missing_url.yaml';

      expect ( () => {
        parseApiKeyDetailsFromFile ( fileAsJson, file, prototype, env );
      } ).toThrow ( `File ${file}. Value for someKey does not have a url` );
    } );

    it ( 'should throw an error if an entry is missing the username', () => {
      const fileAsJson = { someKey: { url: "http://localhost:9200", password: "pass" } };
      const file = 'missing_username.yaml';

      expect ( () => {
        parseApiKeyDetailsFromFile ( fileAsJson, file, prototype, env );
      } ).toThrow ( `File ${file}. Value for someKey does not have a username` );
    } );

    it ( 'should throw an error if an entry is missing the password', () => {
      const fileAsJson = { someKey: { url: "http://localhost:9200", username: "user" } };
      const file = 'missing_password.yaml';

      expect ( () => {
        parseApiKeyDetailsFromFile ( fileAsJson, file, prototype, env );
      } ).toThrow ( `File ${file}. Value for someKey does not have a password` );
    } );
  } );
} );
