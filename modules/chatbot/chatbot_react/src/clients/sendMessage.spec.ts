import { HtmlContentUrlAndAnswer } from "./elastic.search";
import { OpenAiRequest, OpenAiResponse } from "./openai";
import { Message } from "../domain/message";
import { sendMessage, SendMessageConfig, SendMessageFn } from "./sendMessage";

describe('sendMessage', () => {
  const elasticSearch = async (query: string): Promise<HtmlContentUrlAndAnswer[]> => {
    return [
      { htmlContent: 'Test content 1', answer: 'Test answer 1' },
      { htmlContent: 'Test content 2', answer: 'Test answer 2' },
    ];
  };

  const openAi = async (req: OpenAiRequest): Promise<OpenAiResponse> => {
    return [
      { role: 'assistant', content: 'AI response 1' },
      { role: 'assistant', content: 'AI response 2' },
    ];
  };

  const newMessages = (req: OpenAiRequest, aiResponse: OpenAiResponse): Message[] => {
    return [
      ...req.messages,
      ...aiResponse,
    ];
  };

  const config: SendMessageConfig = { elasticSearch, openAi, newMessages };
  const sendMessageFn: SendMessageFn = sendMessage(config);

  test('integrates elasticSearch, openAi, and newMessages functions correctly', async () => {
    const query = 'Test query';
    const messages: Message[] = [{ role: 'user', content: 'User message' }];

    const result = await sendMessageFn(query, messages);

    expect(result).toEqual([
      { role: 'user', content: 'User message' },
      { role: 'assistant', content: 'AI response 1' },
      { role: 'assistant', content: 'AI response 2' },
    ]);
  });
});
