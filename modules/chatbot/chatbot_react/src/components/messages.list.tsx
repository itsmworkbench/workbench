import React, { useEffect, useRef } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';
import Markdown from "react-markdown";

export type Message = {
  content: string;
  role: 'user' | 'system' | 'assistant';
};

export type MessagesListProps = {
  messages: Message[];
};


export type MessageListItemProps = {
  message: Message;
}
export const getStyleForMessage = ( { role }: Message ) => {
  return {
    justifyContent: role === 'user' ? 'flex-start' : 'flex-end',
    backgroundColor: role === 'user' ? '#DCF8C6' : '#91d7df',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '80%',
    whiteSpace: 'pre-line',
  };
};
export function MessageListItem ( { message }: MessageListItemProps ) {
  let { justifyContent, ...style } = getStyleForMessage ( message );
  return <ListItem sx={{ justifyContent }}>
    <div style={style}>
      <Markdown>{message.content||'No content'}</Markdown>
    </div>
  </ListItem>;
}

const listStyle = {
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 200px)', // Adjust based on your layout
  marginBottom: '10px'
};
export function MessagesList ( { messages }: MessagesListProps ) {
  const endOfListRef = useRef ( null );
  useEffect ( () => {
    console.log ( 'scrolling to end', endOfListRef.current );
    const parent = (endOfListRef?.current as any)?.parentElement
    if ( parent ) {
      const listElement = parent
      const scrollHeight = listElement.scrollHeight;
      const height = listElement.clientHeight;
      const maxScrollTop = scrollHeight - height;
      listElement.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  }, [ messages ] );
  if (messages.length===0) return <></>
  return (
    <List sx={listStyle} aria-live="polite">
      {messages.map ( ( message, index ) =>
        <MessageListItem key={index} message={message}/> )}
      <div ref={endOfListRef}/>
    </List>
  );
}
