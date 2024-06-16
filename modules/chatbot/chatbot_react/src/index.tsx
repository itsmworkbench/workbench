import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatBot } from "./components/ChatBot";
import { sendMessage, SendMessageConfig, SendMessageFn } from "./clients/sendMessage";
import { defaultElasticSearchConfig, elasticSearchClient } from "./clients/elastic.search";
import { aiClient, defaultOpenAiConfig } from "./clients/openai";
import { debounceK } from "@itsmworkbench/utils";


const sendMessageConfig: SendMessageConfig = {
  elasticSearch: elasticSearchClient ( defaultElasticSearchConfig () ),
  openAi: aiClient ( defaultOpenAiConfig ),
  newMessages: ( { messages, query }, newMessage ) => [
    ...messages,
    { content: query, role: 'user' },
    ...newMessage
  ] //TODO handle no messages better
}

const send: SendMessageFn = debounceK ( sendMessage ( sendMessageConfig ), 500 );


const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ChatBot sendMessage={send} dispMessage={message => {
      console.log(message);
      return <span>{message.content}</span>;
    }} />
  </React.StrictMode>
);