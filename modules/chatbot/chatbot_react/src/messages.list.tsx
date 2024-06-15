import React, { useEffect, useRef } from 'react';
import { List, ListItem, ListItemText } from '@mui/material';

export type Message = {
  text: string;
  sender: 'user' | 'bot';
};

export type MessagesListProps = {
  messages: Message[];
};

const listStyle = {
  height: '300px',
  overflowY: 'auto' as const,
  marginBottom: '20px',
  border: '1px solid #ccc',
  borderRadius: '8px',
};
export type MessageListItemProps = {
  message: Message;
}
export const getStyleForMessage = ( { sender }: Message ) => {
  return {
    justifyContent: sender === 'user' ? 'flex-start' : 'flex-end',
    backgroundColor: sender === 'user' ? '#DCF8C6' : '#91d7df',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '60%',
  };
};
export function MessageListItem ( { message }: MessageListItemProps ) {
  let { justifyContent, ...style } = getStyleForMessage ( message );
  return <ListItem sx={{ justifyContent }}>
    <ListItemText
      primary={message.text}
      sx={style}
    />
  </ListItem>;
}
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
  return (
    <List sx={listStyle} aria-live="polite">
      {messages.map ( ( message, index ) =>
        <MessageListItem key={index} message={message}/> )}
      <div ref={endOfListRef}/>
    </List>
  );
}
