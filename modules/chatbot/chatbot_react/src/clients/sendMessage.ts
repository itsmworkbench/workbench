import { HtmlContentUrlAndAnswer } from "./elastic.search";
import { OpenAiRequest, OpenAiResponse } from "./openai";
import { Message } from "../domain/message";


export type SendMessageConfig = {
  elasticSearch: ( query: string ) => Promise<HtmlContentUrlAndAnswer[]>
  openAi: ( req: OpenAiRequest ) => Promise<OpenAiResponse>
  newMessages: ( req: OpenAiRequest, aiResponse: OpenAiResponse ) => Message[]
}

export type SendMessageFn = ( query: string, messages: Message[] ) => Promise<Message[]>

export const sendMessage = ( { elasticSearch, openAi, newMessages }: SendMessageConfig ):SendMessageFn =>
  async ( query: string, messages: Message[] ): Promise<Message[]> => {
  const elasticSearchResponse = await elasticSearch ( query )
  const req = { messages, query, source: elasticSearchResponse };
  const openAiResponse: OpenAiResponse = await openAi ( req )
  // const openAiResponse : OpenAiResponse= [{ content: 'some\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\nsome\ncontent\n', role: 'assistant' }]
  return newMessages ( req, openAiResponse );
}