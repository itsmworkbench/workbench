import { HtmlContentUrlAndAnswer } from "./elastic.search";
import axios, { AxiosStatic } from "axios";
import { Message } from "../domain/message";


export type OpenAiConfig = {
  axios: AxiosStatic,
  baseURL?: string
  Authorization: string,
  basePrompt: string,
  model?: string,
  promptFn: ( req: OpenAiRequest ) => string[]
}

export type OpenAiRequest = {

  messages: Message[]
  query: string
  source: HtmlContentUrlAndAnswer[]
}
export type OpenAiResponse = Message[]
export const aiClient = ( { axios, baseURL, Authorization, model, promptFn ,basePrompt}: OpenAiConfig ) => {
  if ( !baseURL ) throw new Error ( 'baseURL is required for open ai. Have you set up the .env file?' );
  if ( !model ) model = "davinci"
  const axiosInstance = axios.create ( {
    baseURL,
    headers: {
      Authorization,
      'Content-Type': 'application/json',
    },
  } );
  return async ( request: OpenAiRequest ): Promise<Message[]> => {
    const assistantMessages: Message[] = promptFn ( request ).map ( ( m, i ) => ({ role: 'assistant', content: m }) )
    const messages: Message[] = [
      { role: 'system', content: basePrompt },
      ...request.messages,
      ...assistantMessages,
      { role: 'user', content: request.query }
    ]
    try {
      const response = await axiosInstance.post ( `/v1/chat/completions`, {
        model,
        messages
      } );
      return response.data.choices.map ( ( x: any ) => x.message );
    } catch ( error ) {
      console.error ( 'Error calling openai:', request, error );
      throw error;
    }
  }
}

export const basePrompt = `You are an AI assistant which answers user questions in a concise manner.
Your job is to respond to the question strictly by reference to the Source that will be provided as assistant content.
If the response content contains pointers or lists, then generate the response in pointers as well but in a concise manner.
always answer in natural human way.
If you don't know the answer, just say that you don't know, don't try to make up an answer.
Aim to answer queries using existing conversational context.
DO NOT IGNORE URLs in response. 
DO NOT use vulgar or insensitive language.
The output should be in markdown"`

export const defaultOpenAiConfig: OpenAiConfig = {
  axios,
  basePrompt,
  baseURL: process.env.REACT_APP_OPENAI_URL,
  Authorization: `Bearer ${process.env.REACT_APP_OPENAI_TOKEN}`,
  promptFn: makePrompts,
  model: 'gpt-3.5-turbo'
}

export function makePrompts ( { source }: OpenAiRequest ): string[] {
  if (source.length=== 0) return [ `No source content found` ]
  const best = source[ 0 ]
  return [ `Source content:  ${best.htmlContent} }` ]
}
