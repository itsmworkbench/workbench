import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ChatTextLine } from "./ChatTextLine";
import { MessagesList } from "./messages.list";
import { SendMessageFn } from "../clients/sendMessage";
import { Scrollable } from "./scrollable";

import { getStyleForMessage, Message } from "../domain/message";
import Markdown from "react-markdown";


export type ChatBotProps = {
  sendMessage: SendMessageFn
  dispMessage: (m: Message, i: number) => React.ReactNode
}
export function ChatBot ( { sendMessage,dispMessage }: ChatBotProps ) {
  const [ messages, setMessages ] = useState<Message[]> ( [] );
  return (
    <Box sx={{ width: '80vh', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>ChatBot</Typography>
      <Scrollable dependencies={[ messages ]}>
        <MessagesList items={messages} itemStyle={getStyleForMessage}>{dispMessage}</MessagesList>
      </Scrollable>
      <ChatTextLine send={( text: string ) =>
        sendMessage ( text, messages ).then ( setMessages )}/>
    </Box>
  );
}
