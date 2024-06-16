import { aiClient, makePrompts, OpenAiConfig, OpenAiRequest } from "./openai";

const basePrompt = 'This is a base prompt for the system message.'; // Define the base prompt

// Helper function to create a mock axios instance
const createMockAxios = () => {
  const mock = {
    create: jest.fn ().mockReturnThis (),
    post: jest.fn (),
  };
  return mock as any;
};

describe ( 'aiClient', () => {
  const baseURL = 'http://localhost:9200';
  const Authorization = 'Bearer test-token';
  const model = 'davinci';
  const promptFn = ( req: OpenAiRequest ) => [ 'Assistant response 1', 'Assistant response 2' ];
  const validConfig: OpenAiConfig = { axios: createMockAxios (), baseURL, Authorization, model, promptFn, basePrompt };

  const request: OpenAiRequest = {
    messages: [ { role: 'user', content: 'User message' } ],
    query: 'User query',
    source: [ { htmlContent: 'Test content', answer: 'Test answer' } ]
  };

  test ( 'throws an error if baseURL is missing', () => {
    expect ( () => aiClient ( { ...validConfig, baseURL: undefined } ) ).toThrow (
      'baseURL is required for open ai. Have you set up the .env file?'
    );
  } );

  test ( 'defaults model to "davinci" if not provided', () => {
    const configWithoutModel: OpenAiConfig = { ...validConfig, model: undefined };
    const client = aiClient ( configWithoutModel );
    expect ( client ).toBeDefined ();
  } );

  test ( 'makes a correct POST request to OpenAI', async () => {
    const mockAxios = createMockAxios ();
    const responseData = { data: { choices: [ { message: { role: 'assistant', content: 'AI response' } } ] } };
    mockAxios.post.mockResolvedValue ( responseData );

    const client = aiClient ( { ...validConfig, axios: mockAxios } );
    const response = await client ( request );

    expect ( mockAxios.create ).toHaveBeenCalledWith ( {
      baseURL,
      headers: {
        Authorization,
        'Content-Type': 'application/json',
      },
    } );
    expect ( mockAxios.post ).toHaveBeenCalledWith ( `/v1/chat/completions`, {
      model,
      messages: [
        { role: 'system', content: basePrompt },
        ...request.messages,
        { role: 'assistant', content: 'Assistant response 1' },
        { role: 'assistant', content: 'Assistant response 2' },
        { role: 'user', content: request.query },
      ]
    } );
    expect ( response ).toEqual ( [ { role: 'assistant', content: 'AI response' } ] );
  } );

  test ( 'handles errors correctly', async () => {
    const mockAxios = createMockAxios ();
    mockAxios.post.mockRejectedValue ( new Error ( 'Network Error' ) );

    const client = aiClient ( { ...validConfig, axios: mockAxios } );

    await expect ( client ( request ) ).rejects.toThrow ( 'Network Error' );
  } );
} );

describe ( 'makePrompts', () => {
  test ( 'returns the correct prompt from the best source', () => {
    const request: OpenAiRequest = {
      messages: [ { role: 'user', content: 'User message' } ],
      query: 'User query',
      source: [
        { htmlContent: 'Test content 1', answer: 'Test answer 1' },
        { htmlContent: 'Test content 2', answer: 'Test answer 2' },
      ],
    };

    const expectedPrompt = [ `Source content:  ${request.source[ 0 ].htmlContent} }` ];

    const result = makePrompts ( request );

    expect ( result ).toEqual ( expectedPrompt );
  } );

  test ( 'handles empty source array', () => {
    const request: OpenAiRequest = {
      messages: [ { role: 'user', content: 'User message' } ],
      query: 'User query',
      source: [],
    };

    const result = makePrompts ( request );

    expect ( result ).toEqual ( [ "No source content found" ] );
  } );

  test ( 'handles undefined htmlContent', () => {
    const request: OpenAiRequest = {
      messages: [ { role: 'user', content: 'User message' } ],
      query: 'User query',
      source: [
        { htmlContent: undefined, answer: 'Test answer 1' },
      ],
    };

    const expectedPrompt = [ `Source content:  undefined }` ];

    const result = makePrompts ( request );

    expect ( result ).toEqual ( expectedPrompt );
  } );

  test ( 'handles single source correctly', () => {
    const request: OpenAiRequest = {
      messages: [ { role: 'user', content: 'User message' } ],
      query: 'User query',
      source: [
        { htmlContent: 'Single source content', answer: 'Single source answer' },
      ],
    };

    const expectedPrompt = [ `Source content:  ${request.source[ 0 ].htmlContent} }` ];

    const result = makePrompts ( request );

    expect ( result ).toEqual ( expectedPrompt );
  } );
} );