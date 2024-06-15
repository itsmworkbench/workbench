import { Message } from "../components/messages.list";
import { HtmlContentAndAnswer } from "./elastic.search";
import { OpenAiRequest, OpenAiResponse } from "./openai";

export type SendMessageConfig = {
  elasticSearch: ( query: string ) => Promise<HtmlContentAndAnswer[]>
  openAi: ( req: OpenAiRequest ) => Promise<OpenAiResponse>
}

export const sendMessage = ( { elasticSearch, openAi }: SendMessageConfig ) => async ( query: string, messages: Message[] ): Promise<Message> => {
  const elasticSearchResponse = await elasticSearch ( query )
  const openAiResponse = await openAi ( { messages, query, source: elasticSearchResponse } )
  return openAiResponse
}