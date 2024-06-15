// ChatBot.tsx
import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { ChatTextInput } from "./ChatTextInput";
import { Message, MessagesList } from "./messages.list";


export const ChatBot: React.FC = () => {
  const [ messages, setMessages ] = useState<Message[]> ( [] );

  function sendMessage ( text: string ) {
    setMessages ( [
      ...messages,
      { text, sender: 'user' },
      { text: 'Faked response', sender: 'bot' }
    ] );
  }
  return (
    <Box sx={{ width: '400px', margin: '0 auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <Typography variant="h4" gutterBottom>ChatBot</Typography>
      <MessagesList messages={messages}/>
      <ChatTextInput send={sendMessage}/>
    </Box>
  );
};
