import React from 'react';
import ReactDOM from 'react-dom';
import { ChatBot } from "./components/ChatBot";
import { SendMessageConfig } from "./clients/sendMessage";
import { fullElasticSearchClient } from "./clients/elastic.search";
import { fullAOpenAi } from "./clients/openai";


const sendMessageConfig: SendMessageConfig = {
  elasticSearch : fullElasticSearchClient,
  openAi: fullAOpenAi
}

ReactDOM.render (
  <React.StrictMode>
    <ChatBot sendMessageConfig={sendMessageConfig}/>
  </React.StrictMode>,
  document.getElementById ( 'root' )
);
