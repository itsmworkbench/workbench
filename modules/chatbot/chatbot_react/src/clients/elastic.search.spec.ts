import { contentAndAnswer, defaultElasticSearchConfig, elasticSearchClient, ElasticSearchConfig, HtmlContentUrlAndAnswer } from "./elastic.search";


describe ('contentAndAnswer', () => {

  describe('contentAndAnswer', () => {
    test('parses Elasticsearch response correctly', () => {
      const response = {
        hits: {
          hits: [
            {
              _source: {
                'X-TIKA:content': '<html><body>Test content</body></html>',
                answer: 'Test answer',
              },
            },
          ],
        },
      };

      const result = contentAndAnswer(response);

      expect(result).toEqual([
        {
          htmlContent: 'Test content',
          answer: 'Test answer',
        },
      ]);
    });

    test('handles empty content correctly', () => {
      const response = {
        hits: {
          hits: [
            {
              _source: {
                'X-TIKA:content': '',
                answer: 'Test answer',
              },
            },
          ],
        },
      };

      const result = contentAndAnswer(response);

      expect(result).toEqual([
        {
          htmlContent: '',
          answer: 'Test answer',
        },
      ]);
    });

    test('handles missing content correctly', () => {
      const response = {
        hits: {
          hits: [
            {
              _source: {
                answer: 'Test answer',
              },
            },
          ],
        },
      };

      const result = contentAndAnswer(response);

      expect(result).toEqual([
        {
          htmlContent: undefined,
          answer: 'Test answer',
        },
      ]);
    });
    test('handles missing answer correctly', () => {
      const response = {
        hits: {
          hits: [
            {
              _source: {
                'X-TIKA:content': '<html><body>Test content</body></html>',
              },
            },
          ],
        },
      };

      const result: HtmlContentUrlAndAnswer[] = contentAndAnswer(response);

      expect(result).toEqual([
        {
          htmlContent: 'Test content',
          answer: undefined,
        },
      ]);
    })

    test('parses multiple hits correctly', () => {
      const response = {
        hits: {
          hits: [
            {
              _source: {
                'X-TIKA:content': '<html><body>Content 1</body></html>',
                answer: 'Answer 1',
              },
            },
            {
              _source: {
                'X-TIKA:content': '<html><body>Content 2</body></html>',
                answer: 'Answer 2',
              },
            },
          ],
        },
      };

      const expectedOutput: HtmlContentUrlAndAnswer[] = [
        {
          htmlContent: 'Content 1',
          answer: 'Answer 1'

        },
        {
          htmlContent: 'Content 2',
          answer: 'Answer 2',

        },
      ];

      const result = contentAndAnswer(response);

      expect(result).toEqual(expectedOutput);
    });
  });

})


// Helper function to create a mock axios instance
const createMockAxios = () => {
  const mock = {
    create: jest.fn().mockReturnThis(),
    post: jest.fn(),
  };
  return mock as any;
};

describe('elasticSearchClient', () => {
  const baseURL = 'http://localhost:9200';
  const index = 'test-index';
  const Authorization = 'Bearer test-token';
  const queryFn = (query: string) => ({ query: { match: { text: query } } });

  const validConfig: ElasticSearchConfig = { axios: createMockAxios(), baseURL, index, Authorization, queryFn };

  test('throws an error if baseURL is missing', () => {
    expect(() => elasticSearchClient({ ...validConfig, baseURL: undefined })).toThrow(
      'baseURL is required for elastic search. Have you set up the .env file?'
    );
  });

  test('throws an error if index is missing', () => {
    expect(() => elasticSearchClient({ ...validConfig, index: undefined })).toThrow(
      'index is required for elastic search. Have you set up the .env file?'
    );
  });

  test('makes a correct POST request to Elasticsearch', async () => {
    const mockAxios = createMockAxios();
    const responseData = { hits: { hits: [{ _source: { 'X-TIKA:content': '<html><body>Test content</body></html>', answer: 'Test answer' } }] } };
    mockAxios.post.mockResolvedValue({ data: responseData });

    const client = elasticSearchClient({ ...validConfig, axios: mockAxios });
    const query = 'test query';
    const response = await client(query);

    expect(mockAxios.create).toHaveBeenCalledWith({
      baseURL,
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
    });
    expect(mockAxios.post).toHaveBeenCalledWith(`/${index}/_search`, queryFn(query));
    expect(response).toEqual([{ htmlContent: 'Test content', answer: 'Test answer' }]);
  });

  test('handles errors correctly', async () => {
    const mockAxios = createMockAxios();
    mockAxios.post.mockRejectedValue(new Error('Network Error'));

    const client = elasticSearchClient({ ...validConfig, axios: mockAxios });
    const query = 'test query';

    await expect(client(query)).rejects.toThrow('Network Error');
  });
});
describe('defaultElasticSearchConfig', () => {
  beforeAll(() => {
    process.env.REACT_APP_ELASTIC_SEARCH_URL = 'http://localhost:9200';
    process.env.REACT_APP_ELASTIC_SEARCH_INDEX = 'test-index';
    process.env.REACT_APP_ELASTIC_SEARCH_TOKEN = 'test-token';
  });

  test('should initialize with environment variables', () => {
    const config = defaultElasticSearchConfig();
    expect(config.baseURL).toBe('http://localhost:9200');
    expect(config.index).toBe('test-index');
    expect(config.Authorization).toBe('ApiKey test-token');
  });

  test('should return correct query object from queryFn', () => {
    const query = 'test query';
    const expectedQueryObject = {
      knn: {
        field: 'full_text_embeddings',
        query_vector_builder: {
          text_embedding: {
            model_id: '.multilingual-e5-small_linux-x86_64',
            model_text: query,
          },
        },
        k: 5,
        num_candidates: 15,
      },
    };

    expect(defaultElasticSearchConfig().queryFn(query)).toEqual(expectedQueryObject);
  });
});