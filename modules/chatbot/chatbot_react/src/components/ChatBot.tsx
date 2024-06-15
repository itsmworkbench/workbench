// ChatBot.tsx
import React, { useCallback, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ChatTextInput } from "./ChatTextInput";
import { Message, MessagesList } from "./messages.list";
import { sendMessage, SendMessageConfig } from "../clients/sendMessage";

export type ChatBotProps = {
  sendMessageConfig: SendMessageConfig
}
export function ChatBot ( { sendMessageConfig }: ChatBotProps ) {
  const [ messages, setMessages ] = useState<Message[]> ( [] );
  const send = useCallback ( sendMessage ( sendMessageConfig ), [ sendMessageConfig ] )
  function onSend ( text: string ) {
    console.log ( 'onSend', text );
    send ( text, messages ).then ( ( newMessage ) => {
      console.log ( 'newMessage', newMessage );
      setMessages ( [
        ...messages,
        { content: text, role: 'user' },
        newMessage
      ] );
    } );
  }
  return (
    <Box sx={{ width: '1200px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>ChatBot</Typography>
      <MessagesList messages={messages}/>
      <ChatTextInput send={onSend}/>
    </Box>
  );
}
