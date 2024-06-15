import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getStyleForMessage, Message, MessageListItem, MessagesList } from "./messages.list";

// Mock messages
const messages: Message[] = [
  { content: 'Hello, how are you?', role: 'user' },
  { content: 'I am fine, thank you!', role: 'bot' },
];
const getBackgroundColor = ( element: HTMLElement ) => {
  return window.getComputedStyle ( element ).backgroundColor;
};
describe ( 'messageslist', () => {

  describe ( 'getStyleForMessage', () => {
    it ( 'returns correct style for user message', () => {
      const style = getStyleForMessage ( { role: 'user', content: 'Test' } );
      expect ( style ).toEqual ( {
        justifyContent: 'flex-start',
        backgroundColor: '#DCF8C6',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
      } );
    } );

    it ( 'returns correct style for bot message', () => {
      const style = getStyleForMessage ( { role: 'bot', content: 'Test' } );
      expect ( style ).toEqual ( {
        justifyContent: 'flex-end',
        backgroundColor: '#91d7df',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
      } );
    } );
  } );

  describe ( 'MessageListItem', () => {
    it ( 'renders a user message correctly', () => {
      const message: Message = { content: 'User message', role: 'user' };
      render ( <MessageListItem message={message}/> );

      const messageElement = screen.getByText ( 'User message' );
      expect ( messageElement ).toBeInTheDocument ();
    } );

    it ( 'renders a bot message correctly', () => {
      const message: Message = { content: 'Bot message', role: 'bot' };
      render ( <MessageListItem message={message}/> );

      const messageElement = screen.getByText ( 'Bot message' );
      expect ( messageElement ).toBeInTheDocument ();

    } );
  } );

  describe ( 'MessagesList', () => {
    it ( 'renders the list of messages', () => {
      render ( <MessagesList messages={messages}/> );

      messages.forEach ( message => {
        const messageElement = screen.getByText ( message.content );
        expect ( messageElement ).toBeInTheDocument ();
      } );
    } );

    it ( 'applies styles correctly to the messages list container', () => {
      render ( <MessagesList messages={messages}/> );

      const listElement = screen.getByRole ( 'list' );
      expect ( listElement ).toHaveStyle ( {
        height: '300px',
        overflowY: 'auto',
        marginBottom: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      } );
    } );
  } );
} )
